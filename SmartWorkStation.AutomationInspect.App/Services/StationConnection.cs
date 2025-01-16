using Microsoft.Extensions.Logging;
using SmartWorkStation.LibATF6000;
using SmartWorkStation.LibTorqueMeter;
using System.IO.Ports;
using System.Reactive.Subjects;

namespace SmartWorkStation.AutomationInspect.App.Services;

public class StationConnection(Station station, ILogger<StationConnection> logger)
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
    private double? _kp, _b;


    public async Task Checking(CancellationToken token)
    {
        if (_checkingStatusStream.Value != Services.CheckingStatus.Idle)
        {
            throw new InvalidOperationException("当前工位正在进行其他操作");
        }
        _checkingStatusStream.OnNext(Services.CheckingStatus.Checking);

        // 开始点检
        foreach (var point in station.CheckingPoints)
        {
            if (token.IsCancellationRequested)
            {
                logger.LogInformation("取消点检");
                break;
            }

            // 切换电批目标扭矩。
            await SwitchTargetTorque(point);

            for (int i = 0; i < station.CheckingTimes; i++)
            {
                if (token.IsCancellationRequested)
                {
                    logger.LogInformation("取消点检");
                    break;
                }
                await AutoRun();
            }
        }

        // 开始调整电批系数
        _kp = 1;
        _b = 0;
        await _atf6000Client.SetFactor((ushort)_kp, (short)_b);
        _checkingStatusStream.OnNext(Services.CheckingStatus.Calibrated);


        if (token.IsCancellationRequested)
        {
            logger.LogInformation("取消老化测试");
            return;
        }

        // 开始老化测试
        _checkingStatusStream.OnNext(Services.CheckingStatus.Aging);

        if (station.ByDuration)
        {
            var startTime = DateTime.Now;
            int count = 0;

            logger.LogInformation("开始老化测试，持续时间{Duration}小时", station.Duration);
            while (DateTime.Now - startTime < TimeSpan.FromMinutes(station.Duration))
            {
                if (token.IsCancellationRequested)
                {
                    logger.LogInformation("取消老化测试");
                    break;
                }
                count++;
                logger.LogInformation("运行测试 {Count}", count);
                await AutoRun();
            }
        }
        else
        {
            logger.LogInformation("开始老化测试，测试次数{Times}", station.Times);
            for (int i = 0; i < station.Times; i++)
            {
                if (token.IsCancellationRequested)
                {
                    logger.LogInformation("取消老化测试");
                    break;
                }
                logger.LogInformation("运行测试 {Count}", i + 1);
                await AutoRun();
            }
        }
        _checkingStatusStream.OnNext(Services.CheckingStatus.Finished);
    }

    private async Task AutoRun()
    {
        await _atf6000Client.StartScrewing();
        await Task.Delay(1000);
        await _atf6000Client.StartReverseScrewing();
        await Task.Delay(1000);
        await _atf6000Client.StopScrewing();
    }

    private async Task SwitchTargetTorque(int point)
    {
        short pSet = 0;
        //获取程序号0的配置
        var config = await _atf6000Client.GetPSetConfig(pSet);
        // 设置扭矩
        config.Step1.Torque = (short)(point * 100);
        await _atf6000Client.SetPSetConfig(pSet, config);
        // 切换程序号0
        await _atf6000Client.ChangePSet(pSet);
    }

    public void Finish()
    {
        if (_checkingStatusStream.Value != Services.CheckingStatus.Finished)
        {
            throw new InvalidOperationException("当前工位未完成测试");
        }
        _checkingStatusStream.OnNext(Services.CheckingStatus.Idle);
    }

    public void GetFactor(out double kp, out double b)
    {
        if (_checkingStatusStream.Value == Services.CheckingStatus.Idle
            || _checkingStatusStream.Value == Services.CheckingStatus.Checking
            || _kp == null || _b == null)
        {
            throw new InvalidOperationException("未校准");
        }
        kp = _kp.Value;
        b = _b.Value;
    }
}
