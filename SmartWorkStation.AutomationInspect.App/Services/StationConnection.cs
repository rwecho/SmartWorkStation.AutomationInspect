using MathNet.Numerics;
using Microsoft.Extensions.Logging;
using Microsoft.Maui.Animations;
using SmartWorkStation.LibATF6000;
using SmartWorkStation.LibTorqueMeter;
using System.Diagnostics;
using System.IO.Ports;
using System.Reactive.Linq;
using System.Reactive.Subjects;

namespace SmartWorkStation.AutomationInspect.App.Services;

public class StationConnection(Station station,
    CheckingService checkingService,
    ILogger<StationConnection> logger)
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

    public string? Error { get; private set; }

    public bool IsIdle => _checkingStatusStream.Value == Services.CheckingStatus.Idle;

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

            // 切换成峰值模式
            if (_torqueMeterClient.InfoStream.Value?.Peek != Peek.Peak)
            {
                await SwitchPeek();
            }

            var checkPointList = new List<CheckPointData>();
            logger.LogInformation("开始点检");
            if (station.Checking)
            {
                // 将补偿重置。
                await _atf6000Client.SetFactor((ushort)(1 * 1000), 0);
                logger.LogInformation("重置电批系数");
            }
            foreach (var point in station.CheckingPoints)
            {
                Trace.WriteLine($"点检 {point}N.m");
                token.ThrowIfCancellationRequested();

                // 切换电批目标扭矩。
                await SwitchTargetTorque(point);

                for (int i = 0; i < station.CheckingTimes; i++)
                {
                    Trace.WriteLine($"运行点检 {point}N.m 第{i + 1}次");
                    token.ThrowIfCancellationRequested();
                    logger.LogInformation("运行点检 {Point:F2}N.m 第{Count}次", point, i + 1);
                    var item = await AutoRun(token);
                    var checkPointData = new CheckPointData(
                        point, i,
                        item.Item1?.Torque,
                        item.Item2
                    );
                    Trace.WriteLine($"点检数据 {checkPointData}");
                    _checkPointSteam.OnNext(checkPointData);
                    checkPointList.Add(checkPointData);
                }
            }

            logger.LogInformation("点检完成");
            //_checkPointSteam.OnCompleted();

            double kp = 0;
            double b = 0;
            // 开始调整电批系数
            if (checkPointList.Count != 0)
            {
                (kp, b) = Calibrate(checkPointList);
                if (station.Checking)
                {
                    logger.LogInformation("开始校准电批系数 kp:{Kp} b:{B}", kp, b);
                    await _atf6000Client.SetFactor((ushort)(kp * 1000), (short)(b * 1000));
                }
            }
            else
            {
                logger.LogInformation("未获取到点检数据或未配置校准，跳过校准电批系数");
            }

            _checkingStatusStream.OnNext(Services.CheckingStatus.Calibrated);
            token.ThrowIfCancellationRequested();

            // 开始老化测试
            _checkingStatusStream.OnNext(Services.CheckingStatus.Aging);

            // 切换电批目标扭矩。
            await SwitchTargetTorque(station.TargetTorque);

            var agingDataList = new List<AgingData>();
            if (station.ByDuration)
            {
                var startTime = DateTime.Now;
                int count = 0;

                logger.LogInformation("开始老化测试，持续时间{Duration}分钟", station.Duration);
                while (DateTime.Now - startTime < TimeSpan.FromMinutes(station.Duration))
                {
                    token.ThrowIfCancellationRequested();
                    logger.LogInformation("运行老化测试 第{Count}次", count);
                    var item = await AutoRun(token);
                    var data = new AgingData(count, item.Item1?.Torque, item.Item2);
                    logger.LogInformation("老化测试数据 {Data}", data);
                    _agingDataStream.OnNext(data);
                    agingDataList.Add(data);
                    count++;
                    logger.LogInformation("剩余时间 {Time}", TimeSpan.FromMinutes(station.Duration) - (DateTime.Now - startTime));
                }
            }
            else
            {
                logger.LogInformation("开始老化测试，测试次数{Times}", station.Times);
                for (int i = 0; i < station.Times; i++)
                {
                    token.ThrowIfCancellationRequested();
                    logger.LogInformation("运行老化测试 第{Count}/{TotalTimes}次", i + 1, station.Times);
                    var item = await AutoRun(token);
                    var data = new AgingData(i, item.Item1?.Torque, item.Item2);
                    logger.LogInformation("老化测试数据 {Data}", data);
                    _agingDataStream.OnNext(data);
                    agingDataList.Add(data);
                }
            }
            logger.LogInformation($"老化测试完成");
            //_agingDataStream.OnCompleted();
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
        catch (TaskCanceledException)
        {
            _checkingStatusStream.OnNext(Services.CheckingStatus.Canceled);
            logger.LogInformation("点检任务取消");
        }
        catch (Exception exception)
        {
            Error = exception.Message;
            _checkingStatusStream.OnNext(Services.CheckingStatus.Error);
            logger.LogError(exception, "点检任务异常");
        }
    }

    public async Task<(RealRecord?, double?)> AutoRun(CancellationToken cancellationToken)
    {
        var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
        cancellationToken.Register(() => timeoutCts.Cancel());
        var tsc = new TaskCompletionSource<(RealRecord?, double?)>();
        await ResetMeter();
        using var disposed = _atf6000Client.RealRecordStream
             .Delay(TimeSpan.FromSeconds(0.5))
             .WithLatestFrom(_torqueMeterClient.ValueStream)
             .Do((item) =>
             {
                 var (record, value) = item;
                 tsc.SetResult(item);
                 logger.LogInformation("获取到电批数据 {Record} ,{Value}", record?.Torque, value);
             })
             .Subscribe();
        Trace.WriteLine("开始自动运行");
        await StartScrewing(station.ScrewingWaitTime, cancellationToken);
        Trace.WriteLine("开始等待");
        await StartReverseScrewing(station.ReverseScrewingWaitTime, cancellationToken);
        Trace.WriteLine("等待完成");
        timeoutCts.Token.Register(() => tsc.TrySetCanceled());
        return await tsc.Task;
    }

    private static (double kp, double b) Calibrate(List<CheckPointData> checkPointList)
    {
        var group = checkPointList.GroupBy(o => o.Point);
        var points = group.Select(o => o.Key).ToArray();

        // 计算扭力测量平均指
        var torques = group.Select(o => o.Where(t => t.ScrewTorque != null)
            .Select(p => p.MeterTorque).Average())
            .Where(t => t != null)
            .Select(t => t!.Value)
            .ToArray();

        if (points.Length != torques.Length)
        {
            throw new InvalidOperationException("Invalid calibrate data.");
        }

        var targetTorque = points.Select(p => (double)p).ToArray();
        var meterTorque = torques.Select(p => p).ToArray();

        // 计算电批系数, 以扭力测量仪为x轴，目标扭矩为y轴, 用线性回归计算出kp斜率和b截距
        var (b, kp) = Fit.Line(meterTorque, targetTorque);
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
        // 增加2秒提前量
        var now = DateTime.Now.AddSeconds(2);
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

    private async Task SwitchTargetTorque(double torque)
    {
        short pSet = 0;
        //获取程序号0的配置
        var config = await _atf6000Client.GetPSetConfig(pSet);
        // 设置扭矩
        config.Step1.Torque = (short)(torque * 100);
        logger.LogInformation("切换电批目标扭矩 {Torque:F2}", torque);
        await _atf6000Client.SetPSetConfig(pSet, config);
        // 切换程序号0
        await _atf6000Client.ChangePSet(pSet);
    }

    public void Finish()
    {
        if (_checkingStatusStream.Value == Services.CheckingStatus.Finished ||
            _checkingStatusStream.Value == Services.CheckingStatus.Canceled ||
          _checkingStatusStream.Value == Services.CheckingStatus.Error)
        {
            _agingDataStream.OnNext(null);
            _checkPointSteam.OnNext(null);

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
