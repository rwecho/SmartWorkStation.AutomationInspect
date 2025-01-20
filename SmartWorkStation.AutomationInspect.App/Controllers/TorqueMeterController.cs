using Microsoft.AspNetCore.Mvc;
using SmartWorkStation.AutomationInspect.App.Services;
using SmartWorkStation.LibTorqueMeter;
using System.Reactive.Subjects;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartWorkStation.AutomationInspect.App.Controllers;

[Route("/api/meter")]
public class TorqueMeterController(StationAutomationManager automationManager) : AbpController
{
    [HttpGet("{id}/value")]
    public IActionResult GetMeterValue(int id, CancellationToken token)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        var value = ((BehaviorSubject<double?>)stationConnection.MeterRealValue).Value;
        return this.Json(value);
    }

    [HttpGet("{id}/info")]
    public IActionResult GetMeterInfo(int id, CancellationToken token)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        var info = ((BehaviorSubject<DigitalTorqueInfo?>)stationConnection.MeterRealInfo).Value;
        return this.Json(info);
    }

    [HttpPost("{id}/peek")]
    public async Task SwitchPeek(int id)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await stationConnection.SwitchPeek();
    }

    [HttpPost("{id}/unit")]
    public async Task SwitchUnit(int id)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await stationConnection.SwitchUnit();
    }

    [HttpPost("{id}/reset")]
    public async Task ResetMeter(int id)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await stationConnection.ResetMeter();
    }
}

