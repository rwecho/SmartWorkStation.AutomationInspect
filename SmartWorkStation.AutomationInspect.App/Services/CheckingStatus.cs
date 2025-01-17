namespace SmartWorkStation.AutomationInspect.App.Services;

public enum CheckingStatus
{
    /// <summary>
    /// 空闲
    /// </summary>
    Idle,

    /// <summary>
    /// 点检中
    /// </summary>
    Checking,

    /// <summary>
    /// 调整中
    /// </summary>
    Calibrated,

    /// <summary>
    /// 老化测试中
    /// </summary>
    Aging,

    /// <summary>
    /// 测试完成
    /// </summary>
    Finished,

    /// <summary>
    /// 出错
    /// </summary>
    Error
}
