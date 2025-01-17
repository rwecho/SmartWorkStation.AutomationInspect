using MathNet.Numerics;
using Microsoft.Extensions.Logging;
using SmartWorkStation.LibATF6000;
using SmartWorkStation.LibTorqueMeter;
using System.IO.Ports;
using System.Reactive.Linq;
using System.Reactive.Subjects;

namespace SmartWorkStation.AutomationInspect.App.Services;

public class StationConnection(Station station, CheckingService checkingService,ILogger<StationConnection> logger)
{
    private readonly ATF6000Client _atf6000Client = new(station.IP, station.Port);

    private readonly TorqueMeterClient _torqueMeterClient = new(station.Com,
        station.BaudRate,
        station.DataBits,
        (Parity)station.Parity,
        (StopBits)station.StopBits);

    public IObservable<RealStatus?> ScrewStatus => _atf6000Client.RealStatusStream;
    public IObservable<double?> MeterRealValue => _torqueMeterClient.ValueStream;
    public IObservable<DigitalTorqueInfo?> MeterRealInfo => _torqueMeterClient.InfoStream;
    private readonly BehaviorSubject<CheckingStatus> _checkingStatusStream = new(Services.CheckingStatus.Idle);
    public IObservable<CheckingStatus> CheckingStatus => _checkingStatusStream;

    private readonly BehaviorSubject<CheckPointData?> _checkPointSteam = new(null);
    public IObservable<CheckPointData?> CheckPointSteam => _checkPointSteam;

    private readonly BehaviorSubject<AgingData?> _agingDataStream = new(null);
    public IObservable<AgingData?> AgingStream => _agingDataStream;


    public async Task Checking(CancellationToken token)
    {
        try
        {
            if (_checkingStatusStream.Value != Services.CheckingStatus.Idle)
            {
                throw new InvalidOperationException("当前工位正在进行其他操作");
            }
            logger.LogInformation("开始点检工位 {Station}", station.Name);
            _checkingStatusStream.OnNext(Services.CheckingStatus.Checking);

            var checkPointList = new List<CheckPointData>();
            // 开始点检
            foreach (var point in station.CheckingPoints)
            {
                token.ThrowIfCancellationRequested();

                // 切换电批目标扭矩。
                logger.LogInformation("切换电批目标扭矩 {Point}", point);
                await SwitchTargetTorque(point);

                for (int i = 0; i < station.CheckingTimes; i++)
                {
                    token.ThrowIfCancellationRequested();
                    logger.LogInformation("运行点检 {Point} {Count}", point, i + 1);
                    var item = await AutoRun(token);
                    var checkPointData = new CheckPointData(
                        point, i,
                        item.Item1?.Torque,
                        item.Item2
                    );
                    _checkPointSteam.OnNext(checkPointData);
                    checkPointList.Add(checkPointData);
                }
            }

            logger.LogInformation("点检完成");
            _checkPointSteam.OnCompleted();

            // 开始调整电批系数
            var (kp, b) = Calibrate(checkPointList);
            logger.LogInformation("开始校准电批系数 kp:{Kp} b:{B}", kp, b);
            await _atf6000Client.SetFactor((ushort)(kp * 100), (short)(b * 100));
            _checkingStatusStream.OnNext(Services.CheckingStatus.Calibrated);

            token.ThrowIfCancellationRequested();

            // 开始老化测试
            _checkingStatusStream.OnNext(Services.CheckingStatus.Aging);

            var agingDataList = new List<AgingData>();
            if (station.ByDuration)
            {
                var startTime = DateTime.Now;
                int count = 0;

                logger.LogInformation("开始老化测试，持续时间{Duration}小时", station.Duration);
                while (DateTime.Now - startTime < TimeSpan.FromMinutes(station.Duration))
                {
                    token.ThrowIfCancellationRequested();
                    logger.LogInformation("运行老化测试 {Count}", count);
                    var item = await AutoRun(token);
                    var data = new AgingData(count, item.Item1?.Torque, item.Item2);
                    logger.LogInformation("老化测试数据 {Data}", data);
                    _agingDataStream.OnNext(data);
                    agingDataList.Add(data);
                    count++;
                }
            }
            else
            {
                logger.LogInformation("开始老化测试，测试次数{Times}", station.Times);
                for (int i = 0; i < station.Times; i++)
                {
                    token.ThrowIfCancellationRequested();
                    logger.LogInformation("运行老化测试 {Count}", i + 1);
                    var item = await AutoRun(token);
                    var data = new AgingData(i, item.Item1?.Torque, item.Item2);
                    logger.LogInformation("老化测试数据 {Data}", data);
                    _agingDataStream.OnNext(data);
                    agingDataList.Add(data);
                }
            }
            _agingDataStream.OnCompleted();
            _checkingStatusStream.OnNext(Services.CheckingStatus.Finished);

            var checkReport = new CheckingReport
            {
                Id = station.Id,
                StartTime = DateTime.Now,
                EndTime = DateTime.Now,
                Name = station.Name,
                Kp = kp,
                B = b,
                PointData = checkPointList,
                AgingData = agingDataList
            };
            logger.LogInformation("生成报告 {Report}", checkReport);
            await checkingService.CreateReportAsync(checkReport);
        }
        catch (TaskCanceledException exception)
        {
            _checkingStatusStream.OnNext(Services.CheckingStatus.Idle);
            logger.LogInformation("点检任务取消");
        }
        catch (Exception exception)
        {
            _checkingStatusStream.OnNext(Services.CheckingStatus.Error);
            logger.LogError(exception, "点检任务异常");
        }
    }

    public async Task<(RealRecord?, double?)> AutoRun(CancellationToken cancellationToken)
    {
        var tsc = new TaskCompletionSource<(RealRecord?, double?)>();
        using var disposed = _atf6000Client.RealRecordStream
             .Delay(TimeSpan.FromSeconds(0.2))
             .WithLatestFrom(_torqueMeterClient.ValueStream)
             .Do((item) =>
             {
                 if (tsc.Task.IsCompleted) return;
                 tsc.SetResult(item);
             })
             .Subscribe();
        await StartScrewing(3.5, cancellationToken);
        await StartReverseScrewing(2.5, cancellationToken);
        var result = await tsc.Task;
        await ResetMeter();
        return result;
    }

    private static (double kp, double b) Calibrate(List<CheckPointData> checkPointList)
    {
        var group = checkPointList.GroupBy(o => o.Point);
        var points = group.Select(o => o.Key).ToArray();
        var torques = group.Select(o => o.Where(t => t.ScrewTorque != null).Select(p => p.ScrewTorque).Average())
            .Where(t => t != null)
            .Select(t => t!.Value)
            .ToArray();
        // 计算电批系数, 以points为x轴，torques为y轴, 用线性回归计算出kp 斜率和b 截距 ，MathNet.Numerics
        var (b, kp) = Fit.Line([.. points.Select(p => (double)p)], [.. torques]);
        return (kp, b);
    }

    public async Task StartScrewing(double seconds, CancellationToken cancellationToken)
    {
        logger.LogInformation("开始拧紧");
        await _atf6000Client.StartScrewing();
        await Task.Delay((int)(seconds * 1000), cancellationToken);
        logger.LogInformation("停止拧紧");
        await _atf6000Client.StopScrewing();
        await Task.Delay(200, cancellationToken);
    }

    public async Task StartReverseScrewing(double seconds, CancellationToken cancellationToken)
    {
        logger.LogInformation("开始反拧");
        await _atf6000Client.StartReverseScrewing();
        await Task.Delay((int)(seconds * 1000), cancellationToken);
        logger.LogInformation("停止反拧");
        await _atf6000Client.StopScrewing();
        await Task.Delay(200, cancellationToken);
    }

    public async Task SyncTime()
    {
        var now = DateTime.Now;
        var year = now.Year;
        var month = now.Month;
        var day = now.Day;
        var hour = now.Hour;
        var minute = now.Minute;
        var second = now.Second;

        logger.LogInformation("同步时间 {Year}-{Month}-{Day} {Hour}:{Minute}:{Second}", year, month, day, hour, minute, second);
        await _atf6000Client.SetTime(year, month, day, hour, minute, second);
    }

    public async Task Lock()
    {
        logger.LogInformation("锁定电批");
        await _atf6000Client.Lock();
    }

    public async Task Unlock()
    {
        logger.LogInformation("解锁电批");
        await _atf6000Client.Unlock();
    }

    private async Task SwitchTargetTorque(int torque)
    {
        short pSet = 0;
        //获取程序号0的配置
        var config = await _atf6000Client.GetPSetConfig(pSet);
        // 设置扭矩
        config.Step1.Torque = (short)(torque * 100);
        logger.LogInformation("切换电批目标扭矩 {Torque}", torque);
        await _atf6000Client.SetPSetConfig(pSet, config);
        // 切换程序号0
        await _atf6000Client.ChangePSet(pSet);
    }

    public void Finish()
    {
        if (_checkingStatusStream.Value == Services.CheckingStatus.Finished ||
          _checkingStatusStream.Value == Services.CheckingStatus.Error)
        {
            _checkingStatusStream.OnNext(Services.CheckingStatus.Idle);
        }
    }

    public async Task<(ushort kp, short b)> GetFactor()
    {
        if (_checkingStatusStream.Value == Services.CheckingStatus.Idle
            || _checkingStatusStream.Value == Services.CheckingStatus.Checking)
        {
            throw new InvalidOperationException("未校准");
        }
        logger.LogInformation("获取电批系数");
        return await _atf6000Client.GetFactor();
    }


    public Task StartAsync()
    {
        try
        {
            _atf6000Client.Connect();

        }
        catch (Exception exception)
        {
            logger.LogError(exception, "连接ATF6000失败");
        }
        try
        {
            _torqueMeterClient.Connect();
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "连接扭矩仪失败");
        }

        return Task.CompletedTask;
    }

    public Task StopAsync()
    {
        logger.LogInformation("停止工位 {Station}", station.Name);
        _atf6000Client.Disconnect();
        _torqueMeterClient.Disconnect();
        return Task.CompletedTask;
    }

    public async Task SwitchPeek()
    {
        logger.LogInformation("切换电批峰值");
        await _torqueMeterClient.TogglePeek();
    }

    private byte[] unitCommands = [0x15, 0x16, 0x13];

    private int _unitIndex = 0;

    public async Task SwitchUnit()
    {
        logger.LogInformation("切换扭矩仪单位");
        var command = unitCommands[_unitIndex++ % unitCommands.Length];
        await _torqueMeterClient.ToggleUnit(command);
    }

    public async Task ResetMeter()
    {
        logger.LogInformation("重置扭矩仪");
        await _torqueMeterClient.Reset();
    }
}
