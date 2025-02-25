using System.Collections.Concurrent;
using Volo.Abp.DependencyInjection;

namespace SmartWorkStation.AutomationInspect.App.Services;

public class StationAutomationManager(StationService stationService,
    IServiceProvider serviceProvider) : ISingletonDependency
{
    private readonly ConcurrentDictionary<int, StationConnection> _connections = new();

    private readonly ConcurrentDictionary<int, CheckingTask> _checkingTasks = new();

    public async Task StartAsync()
    {
        stationService.OnAdd += OnStationAdd;
        stationService.OnRemove += OnStationRemove;
        stationService.OnUpdate += OnStationUpdate;

        var stations = await stationService.GetListAsync();
        foreach (var station in stations)
        {
            var connection = ActivatorUtilities.CreateInstance<StationConnection>(serviceProvider, station);
            _connections.TryAdd(station.Id, connection);
        }
        foreach (var connection in _connections.Values)
        {
            await connection.StartAsync();
        }
    }

    public async Task StopAsync()
    {
        foreach (var connection in _connections.Values)
        {
            await connection.StopAsync();
        }
    }

    public StationConnection GetStationConnection(int id)
    {
        if (_connections.TryGetValue(id, out var connection))
        {
            return connection;
        }
        else
        {
            throw new InvalidOperationException("The station is not connected.");
        }
    }

    private void OnStationAdd(Station station)
    {
        var connection = ActivatorUtilities.CreateInstance<StationConnection>(serviceProvider, station);
        if (_connections.TryAdd(station.Id, connection))
            connection.StartAsync();
    }

    private void OnStationRemove(Station station)
    {
        if (_connections.TryRemove(station.Id, out var connection))
            connection.StopAsync();
    }

    private void OnStationUpdate(Station station)
    {
        OnStationRemove(station);
        OnStationAdd(station);
    }

    public Task StartChecking(int id)
    {
        var connection = GetStationConnection(id);

        if (!connection.IsIdle)
        {
            throw new InvalidOperationException("工作站正在工作中，请稍后再试。");
        }

        var cts = new CancellationTokenSource();
        var task = Task.Run(() => connection.Checking(cts.Token), cts.Token);
        _checkingTasks[id] = new CheckingTask(task, cts);
        return Task.CompletedTask;
    }

    public async Task CancelChecking(int id)
    {
        if (_checkingTasks.TryRemove(id, out var checkingTask))
        {
            if (!checkingTask.Cts.IsCancellationRequested)
            {
                checkingTask.Cts.Cancel();
            }
            await checkingTask.Task;
        }
    }

    private record CheckingTask(Task Task, CancellationTokenSource Cts);
}
