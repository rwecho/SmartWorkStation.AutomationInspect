namespace SmartWorkStation.AutomationInspect.App.Controllers;

public partial class ReportsQueryInput
{
    public int? Id { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime? EndTime
    {
        get; set;
    }
}
