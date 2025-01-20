namespace SmartWorkStation.AutomationInspect.App.Services;

public record AgingData(int Index, double? ScrewTorque, double? MeterTorque)
{
    public override string ToString()
    {
        return $"Aging data 序号:{Index} screw: {ScrewTorque} meter: {MeterTorque}";
    }
};
