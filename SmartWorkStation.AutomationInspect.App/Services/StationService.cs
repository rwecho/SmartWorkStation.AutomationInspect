using System.Text.Json;
using Volo.Abp.DependencyInjection;

namespace SmartWorkStation.AutomationInspect.App.Services;

public class StationService
{
    private List<Station> _stations = [];
    private readonly string _filePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "AppData", "stations.json");
    private readonly SemaphoreSlim _lock = new(1, 1);

    private readonly Task _loadTask;

    public StationService()
    {
        _loadTask = Task.Run(LoadAsync);
    }

    private async Task LoadAsync()
    {
        try
        {
            await _lock.WaitAsync();

            if (File.Exists(_filePath))
            {
                var json = await File.ReadAllTextAsync(_filePath);
                _stations = JsonSerializer.Deserialize<List<Station>>(json) ?? new List<Station>();
            }
        }
        finally
        {
            _lock.Release();
        }

    }

    public async Task<Station> CreateStationAsync(Station station)
    {
        ArgumentNullException.ThrowIfNull(station);

        await _loadTask;
        try
        {
            await _lock.WaitAsync();

            // check if the station id is already in use
            if (_stations.Any(s => s.Id == station.Id))
                throw new InvalidOperationException("The station id is already in use.");

            _stations.Add(station);
            await SaveStationsAsync();
        }
        finally
        {
            _lock.Release();
        }
        return station;
    }

    public async Task<Station?> GetStationAsync(int id)
    {
        await _loadTask;
        try
        {
            await _lock.WaitAsync();
            return _stations.FirstOrDefault(s => s.Id == id);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<IEnumerable<Station>> GetAllStationsAsync()
    {
        await _loadTask;
        try
        {
            await _lock.WaitAsync();
            return _stations.AsEnumerable();
        }
        finally
        {
            await _lock.WaitAsync();
        }
    }

    public async Task<bool> UpdateStationAsync(Station station)
    {
        ArgumentNullException.ThrowIfNull(station);
        await _loadTask;
        try
        {
            await _lock.WaitAsync();
            var existingStation = _stations.FirstOrDefault(s => s.Id == station.Id);
            if (existingStation == null)
                return false;

            _stations.Remove(existingStation);
            _stations.Add(station);
            await SaveStationsAsync();
        }
        finally
        {
            await _lock.WaitAsync();
        }
        return true;
    }

    public async Task<bool> DeleteStationAsync(int id)
    {
        await _loadTask;
        try
        {
            await _lock.WaitAsync();
            var station = _stations.FirstOrDefault(s => s.Id == id);
            if (station == null)
                return false;

            _stations.Remove(station);
            await SaveStationsAsync();
        }
        finally
        {
            await _lock.WaitAsync();
        }
        return true;
    }

    private async Task SaveStationsAsync()
    {
        var json = JsonSerializer.Serialize(_stations);
        var directory = Path.GetDirectoryName(_filePath);
        if (!Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory!);
        }
        await File.WriteAllTextAsync(_filePath, json);
    }
}
