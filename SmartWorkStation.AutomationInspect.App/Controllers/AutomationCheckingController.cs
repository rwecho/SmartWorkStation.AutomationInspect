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
    [HttpGet("{id}/status")]
    public async Task GetStatusAsync(int id, CancellationToken token)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        var statusObservable = stationConnection.CheckingStatus.Select(status => (byte)status);
        await StreamObservableAsync(statusObservable, token);
    }

    [HttpPost("{id}/start")]
    public async Task<IActionResult> StartChecking(int id, CancellationToken token)
    {
        try
        {
            await automationManager.StartChecking(id);
            return Ok();
        }
        catch (InvalidOperationException exception)
        {
            throw new UserFriendlyException(exception.Message, innerException: exception);
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelChecking(int id)
    {
        try
        {
            await automationManager.CancelChecking(id);
            return Ok();
        }
        catch (InvalidOperationException exception)
        {
            throw new UserFriendlyException(exception.Message, innerException: exception);
        }
    }

    [HttpPost("{id}/finish")]
    public IActionResult FinishAsync(int id)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        stationConnection.Finish();
        return Ok();
    }

    [HttpGet("{id}/factor")]
    public async Task<IActionResult> GetFactorAsync(int id, CancellationToken token)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        var (kp, b) = await stationConnection.GetFactor();
        return this.Json(new
        {
            kp,
            b
        });
    }

    [HttpGet("{id}/check-point/data")]
    public async Task GetCheckPointDataAsync(int id, CancellationToken token)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await StreamObservableAsync(stationConnection.CheckPointSteam, token);
    }

    [HttpGet("{id}/aging/data")]
    public async Task GetAgingDataAsync(int id, CancellationToken token)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await StreamObservableAsync(stationConnection.AgingStream, token);
    }

    private async Task StreamObservableAsync<T>(IObservable<T> observable, CancellationToken token)
    {
        Response.Clear();
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
        catch(TaskCanceledException)
        {
            // ignored
        }
        finally
        {
            subscription.Dispose();
        }
    }
}

