using System.Text.Json;
using Volo.Abp.DependencyInjection;

namespace SmartWorkStation.AutomationInspect.App.Services;


public class StationService : ITransientDependency
{
    private List<Station> _stations = [];
    private readonly string _filePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "AppData", "stations.json");
    private readonly SemaphoreSlim _semaphore = new(1, 1);
    private readonly Task _loadTask;

    public event Action<Station>? OnAdd;
    public event Action<Station>? OnRemove;
    public event Action<Station>? OnUpdate;

    public StationService()
    {
        var directory = Path.GetDirectoryName(_filePath);

        if (!Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory!);
        }

        _loadTask = Task.Run(LoadAsync);
    }

    private async Task LoadAsync()
    {
        try
        {
            await _semaphore.WaitAsync();

            if (File.Exists(_filePath))
            {
                var json = await File.ReadAllTextAsync(_filePath);
                _stations = JsonSerializer.Deserialize<List<Station>>(json) ?? new List<Station>();
            }
        }
        catch (Exception e)
        {
            File.Move(_filePath, _filePath + $".{DateTime.Now:yyyyMMdd}.error");
            throw new InvalidOperationException("Failed to load stations.", e);
        }
        finally
        {
            _semaphore.Release();
        }

    }

    public async Task<Station> CreateAsync(Station station)
    {
        ArgumentNullException.ThrowIfNull(station);

        await _loadTask;
        try
        {
            await _semaphore.WaitAsync();

            // check if the station id is already in use
            if (_stations.Any(s => s.Id == station.Id))
            {
                throw new InvalidOperationException("The station id is already in use.");
            }

            _stations.Add(station);
            await SaveAsync();
            OnAdd?.Invoke(station);
        }
        finally
        {
            _semaphore.Release();
        }
        return station;
    }

    public async Task<Station?> GetAsync(int id)
    {
        await _loadTask;
        try
        {
            await _semaphore.WaitAsync();
            return _stations.FirstOrDefault(s => s.Id == id);
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<IEnumerable<Station>> GetListAsync()
    {
        await _loadTask;
        try
        {
            await _semaphore.WaitAsync();
            return _stations.AsEnumerable();
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<Station> UpdateAsync(Station station)
    {
        ArgumentNullException.ThrowIfNull(station);
        await _loadTask;
        try
        {
            await _semaphore.WaitAsync();
            var existingStation = _stations.FirstOrDefault(s => s.Id == station.Id);
            if (existingStation == null)
                throw new InvalidOperationException("The station does not exist.");

            _stations.Remove(existingStation);
            _stations.Add(station);
            await SaveAsync();

            OnUpdate?.Invoke(station);
            return station;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        await _loadTask;
        try
        {
            await _semaphore.WaitAsync();
            var station = _stations.FirstOrDefault(s => s.Id == id);
            if (station == null)
                return false;

            _stations.Remove(station);
            await SaveAsync();
            OnRemove?.Invoke(station);
        }
        finally
        {
            _semaphore.Release();
        }
        return true;
    }

    private async Task SaveAsync()
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
