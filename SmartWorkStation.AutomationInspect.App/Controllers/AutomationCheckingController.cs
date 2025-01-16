using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SmartWorkStation.AutomationInspect.App.Services;
using System.Reactive.Linq;
using System.Text.Json;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartWorkStation.AutomationInspect.App.Controllers;

[Route("/api/checking")]
public class AutomationCheckingController(StationAutomationManager automationManager) : AbpController
{
    [HttpPost("{id}")]
    public async Task<IActionResult> StartChecking(int id, CancellationToken token)
    {
        try
        {
            var stationConnection = automationManager.GetStationConnection(id);
            await stationConnection.Checking(token);
            return Ok();
        }
        catch (InvalidOperationException exception)
        {
            throw new UserFriendlyException(exception.Message, innerException: exception);
        }
    }

    [HttpGet("{id}/screw-status")]
    public async Task GetScrewStatus(int id, CancellationToken token)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await StreamObservableAsync(stationConnection.ScrewStatus, token);
    }

    [HttpGet("{id}/meter/value")]
    public async Task GetMeterValue(int id, CancellationToken token)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await StreamObservableAsync(stationConnection.MeterRealValue, token);
    }

    [HttpGet("{id}/meter/info")]
    public async Task GetMeterInfo(int id, CancellationToken token)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await StreamObservableAsync(stationConnection.MeterRealInfo, token);
    }

    [HttpGet("{id}/status")]
    public async Task GetStatusAsync(int id, CancellationToken token)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        var statusObservable = stationConnection.CheckingStatus.Select(status => (byte)status);
        await StreamObservableAsync(statusObservable, token);
    }

    [HttpPost("{id}/finish")]
    public IActionResult FinishAsync(int id)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        stationConnection.Finish();
        return Ok();
    }

    [HttpGet("{id}/factor")]
    public IActionResult GetFactorAsync(int id, CancellationToken token)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        stationConnection.GetFactor(out var kp, out var b);
        return this.Json(new
        {
            KP = kp,
            B = b
        });
    }

    private async Task StreamObservableAsync<T>(IObservable<T> observable, CancellationToken token)
    {
        Response.ContentType = "text/event-stream";
        var tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        token.Register(() => tcs.TrySetCanceled(token));

        var subscription = observable
            .Select(item => Observable.FromAsync(async () =>
            {
                var json = JsonSerializer.Serialize(item);
                await Response.WriteAsync($"data: {json}\n\n");
                await Response.Body.FlushAsync();
            }))
            .Concat()
            .Subscribe(
                _ => { },
                ex => tcs.TrySetException(ex),
                () => tcs.TrySetResult(true)
            );

        try
        {
            await tcs.Task;
        }
        finally
        {
            subscription.Dispose();
        }
    }
}

