using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SmartWorkStation.AutomationInspect.App.Services;
using System.Reactive;
using System.Reactive.Linq;
using System.Text.Json;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartWorkStation.AutomationInspect.App.Controllers;

[Route("/api/checking")]
public class AutomationCheckingController(StationAutomationManager automationManager) : AbpController
{
    [HttpGet("{id}/screw-status")]
    public async Task GetScrewStatus(int id, CancellationToken token)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await StreamObservableAsync(stationConnection.ScrewStatus, token);
    }


    [HttpPost("{id}/screwing")]
    public async Task StartScrewing(int id)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        //await stationConnection.StartScrewing(3.5, default);
        await stationConnection.AutoRun(default);
    }

    [HttpPost("{id}/reverse-screwing")]
    public async Task StartReverseScrewing(int id)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await stationConnection.StartReverseScrewing(2.5, default);
    }

    [HttpPost("{id}/sync-time")]
    public async Task SyncTime(int id)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await stationConnection.SyncTime();
    }

    [HttpPost("{id}/lock")]
    public async Task Lock(int id)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await stationConnection.Lock();
    }


    [HttpPost("{id}/unlock")]
    public async Task Unlock(int id)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await stationConnection.Unlock();
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

    [HttpPost("{id}/meter/peek")]
    public async Task SwitchPeek(int id)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await stationConnection.SwitchPeek();
    }

    [HttpPost("{id}/meter/unit")]
    public async Task SwitchUnit(int id)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await stationConnection.SwitchUnit();
    }

    [HttpPost("{id}/meter/reset")]
    public async Task ResetMeter(int id)
    {
        var stationConnection = automationManager.GetStationConnection(id);
        await stationConnection.ResetMeter();
    }

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
            kp = kp,
            b = b
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

