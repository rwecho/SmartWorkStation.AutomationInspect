using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Nito.Disposables;
using SmartWorkStation.AutomationInspect.App.Services;
using System.Reactive.Linq;
using System.Text.Json;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartWorkStation.AutomationInspect.App.Controllers;

[Route("/api/checking")]
public class AutomationCheckingController(StationAutomationManager automationManager) : AbpController
{
    [HttpPost("{id}/start")]
    public async Task<IActionResult> StartChecking(int id, CancellationToken token)
    {
        try
        {
            await automationManager.StartChecking(id);
        }
        catch (Exception exception)
        {
            throw new UserFriendlyException(exception.Message, innerException: exception);
        }
        return this.Ok();
    }


    [HttpGet("{id}/status")]
    public async Task GetCheckingStatus(int id, CancellationToken token)
    {
        Response.Clear();
        Response.ContentType = "text/event-stream";
        var tcs = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        token.Register(() => tcs.TrySetCanceled(token));
        var stationConnection = automationManager.GetStationConnection(id);
        var statusSubject = stationConnection.CheckingStatus.Select(status => (byte)status);

        using var disposables = new System.Reactive.Disposables.CompositeDisposable();
        var disposable = stationConnection.CheckingStatus
            .Select(status => Observable.FromAsync(async () =>
            {
                await Response.WriteAsync($"event: status\n");
                await Response.WriteAsync($"data: {(int)status}\n\n");
                switch (status)
                {
                    case CheckingStatus.Idle:
                        break;
                    case CheckingStatus.Checking:
                        disposables.Add(stationConnection.CheckPointSteam
                            .Select(item => Observable.FromAsync(async () =>
                            {
                                if (item == null) return;

                                var json = JsonSerializer.Serialize(item);
                                await Response.WriteAsync($"event: checking\n");
                                await Response.WriteAsync($"data: {json}\n\n");
                            }))
                            .Concat()
                            .Subscribe());
                        break;
                    case CheckingStatus.Calibrated:
                        {
                            var (kp, b) = await stationConnection.GetFactor();
                            var json = JsonSerializer.Serialize(new
                            {
                                kp,
                                b
                            });
                            await Response.WriteAsync($"event: calibrated\n");
                            await Response.WriteAsync($"data: {json}\n\n");
                        }
                        break;
                    case CheckingStatus.Aging:
                        {
                            disposables.Add(stationConnection.AgingStream
                                .Select(item => Observable.FromAsync(async () =>
                                {
                                    if (item == null) return;

                                    var json = JsonSerializer.Serialize(item);
                                    await Response.WriteAsync($"event: aging\n");
                                    await Response.WriteAsync($"data: {json}\n\n");
                                }))
                                .Concat()
                                .Subscribe());
                        }
                        break;
                    case CheckingStatus.Canceled:
                        tcs.SetCanceled();
                        break;
                    case CheckingStatus.Finished:
                        tcs.SetResult();
                        break;
                    case CheckingStatus.Error:
                        {
                            var error = stationConnection.Error;
                            await Response.WriteAsync($"event: onerror\n");
                            await Response.WriteAsync($"data: {error}\n\n");
                        }
                        break;
                    default:
                        break;
                }
            }))
            .Switch()
            .Subscribe(
                onNext: _ => { },
                onError: tcs.SetException,
                onCompleted: tcs.SetResult
            );
        disposables.Add(disposable);

        try
        {
            await tcs.Task;
        }
        catch (TaskCanceledException)
        {
            // ignored
        }
        finally
        {
            disposables.Dispose();
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
}

