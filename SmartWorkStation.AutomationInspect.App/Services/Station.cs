namespace SmartWorkStation.AutomationInspect.App.Services;

/// <summary>
/// 工作站
/// </summary>
public class Station
{
    /// <summary>
    /// 编号
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// 工作站名称
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// 工作站通信IP地址
    /// </summary>
    public required string IP { get; set; }

    /// <summary>
    /// 工作站通信端口
    /// </summary>
    public required int Port { get; set; }

    /// <summary>
    /// 是否点检
    /// </summary>
    public bool Checking { get; set; } = true;

    /// <summary>
    /// 点检点，每个点代表一个力矩
    /// </summary>
    public int[] CheckingPoint { get; set; } = [];

    /// <summary>
    /// 每个点检点的检测次数
    /// </summary>
    public int CheckingTimes { get; set; } = 10;

    /// <summary>
    /// 老化测试以时间还是次数为准
    /// </summary>
    public bool ByDuration { get; set; } = true;

    /// <summary>
    /// 老化测试时间
    /// </summary>
    public int Duration { get; set; } = 1;

    /// <summary>
    /// 老化测试次数
    /// </summary>
    public int Times { get; set; } = 100;

    /// <summary>
    /// 老化目标力矩
    /// </summary>
    public double TargetTorque { get; set; } = 0;

}
