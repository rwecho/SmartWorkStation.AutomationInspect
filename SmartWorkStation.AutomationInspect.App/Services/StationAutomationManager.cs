using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;
using Volo.Abp.DependencyInjection;

namespace SmartWorkStation.AutomationInspect.App.Services;

public class StationAutomationManager(StationService stationService,
    IServiceProvider serviceProvider) : ISingletonDependency
{
    private readonly ConcurrentDictionary<int, StationConnection> _connections = new();

    public async Task StartAsync()
    {
        stationService.OnAdd += OnStationAdd;
        stationService.OnRemove += OnStationRemove;
        stationService.OnUpdate += OnStationUpdate;

        var stations = await stationService.GetListAsync();
        foreach (var station in stations)
        {
            _connections.TryAdd(station.Id,
                new StationConnection(station, serviceProvider.GetRequiredService<ILogger<StationConnection>>()));
        }
    }

    public Task StopAsync()
    {
        return Task.CompletedTask;
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
        var connection = new StationConnection(station,
            serviceProvider.GetRequiredService<ILogger<StationConnection>>());
        _connections.TryAdd(station.Id, connection);
    }

    private void OnStationRemove(Station station)
    {
        _connections.TryRemove(station.Id, out var connection);
    }

    private void OnStationUpdate(Station station)
    {
        OnStationRemove(station);
        OnStationAdd(station);
    }
}
