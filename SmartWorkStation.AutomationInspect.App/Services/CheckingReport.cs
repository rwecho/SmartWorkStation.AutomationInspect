namespace SmartWorkStation.AutomationInspect.App.Services;

public class CheckingReport
{
    public required int Id { get; set; }
    public required DateTime StartTime { get; set; }
    public required DateTime EndTime { get; set; }
    public required string Name { get; set; }
    public double Kp { get; set; }
    public double B { get; set; }
    public required List<CheckPointData> PointData { get; set; }
    public required List<AgingData> AgingData { get; set; }

    public override string ToString()
    {
        return $"名称:{Name}";
    }
}
