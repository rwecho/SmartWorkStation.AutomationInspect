using System.Text.Json;
using Volo.Abp.DependencyInjection;

namespace SmartWorkStation.AutomationInspect.App.Services;

public class CheckingService : ISingletonDependency
{
    private readonly SemaphoreSlim _semaphore = new(1, 1);

    private string _baseReportFolder => Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "AppData", "Data");

    public CheckingService()
    {
        if (!Directory.Exists(_baseReportFolder))
        {
            Directory.CreateDirectory(_baseReportFolder);
        }
    }

    private string GetDailyFolder(DateTime date)
    {
        var dailyFolder = Path.Combine(_baseReportFolder, date.ToString("yyyyMMdd"));
        if (!Directory.Exists(dailyFolder))
        {
            Directory.CreateDirectory(dailyFolder);
        }
        return dailyFolder;
    }

    public async Task CreateReportAsync(CheckingReport report)
    {
        var dailyFolder = GetDailyFolder(report.StartTime);
        var reportFilePath = Path.Combine(dailyFolder, $"{report.Id}-{report.StartTime:yyyyMMddHHmmss}.json");

        try
        {
            await _semaphore.WaitAsync();
            var json = JsonSerializer.Serialize(report);
            await File.WriteAllTextAsync(reportFilePath, json);
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<List<CheckingReport>> GetReportsAsync(
        int? id,
        DateTime? startTime,
        DateTime? endTime
        )
    {
        var reports = new List<CheckingReport>();
        try
        {
            await _semaphore.WaitAsync();

            // Get all folders within the date range
            var allFolders = Directory.GetDirectories(_baseReportFolder);
            var relevantFolders = allFolders;

            if (startTime.HasValue || endTime.HasValue)
            {
                relevantFolders = allFolders.Where(folder =>
                {
                    var folderDate = DateTime.ParseExact(
                        Path.GetFileName(folder),
                        "yyyyMMdd",
                        System.Globalization.CultureInfo.InvariantCulture);

                    return (!startTime.HasValue || folderDate.Date >= startTime.Value.Date) &&
                           (!endTime.HasValue || folderDate.Date <= endTime.Value.Date);
                }).ToArray();
            }

            foreach (var folder in relevantFolders)
            {
                var files = Directory.GetFiles(folder, "*.json");
                foreach (var file in files)
                {
                    var json = await File.ReadAllTextAsync(file);
                    var report = JsonSerializer.Deserialize<CheckingReport>(json);
                    if (report == null)
                        continue;

                    if (id.HasValue && report.Id != id)
                        continue;

                    if (startTime.HasValue && report.StartTime < startTime)
                        continue;

                    if (endTime.HasValue && report.EndTime > endTime)
                        continue;

                    reports.Add(report);
                }
            }
        }
        finally
        {
            _semaphore.Release();
        }
        return reports;
    }
}