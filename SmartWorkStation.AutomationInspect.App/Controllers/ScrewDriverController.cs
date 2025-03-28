using Microsoft.AspNetCore.Mvc;
using SmartWorkStation.AutomationInspect.App.Services;
using SmartWorkStation.LibATF6000;
using System.Reactive.Subjects;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartWorkStation.AutomationInspect.App.Controllers;

[Route("/api/screw")]
    public class ScrewDriverController(StationAutomationManager automationManager) : AbpController
    {
        [HttpGet("{id}/status")]
        public IActionResult GetScrewStatus(int id, CancellationToken token)
        {
            var stationConnection = automationManager.GetStationConnection(id);
            var status = ((BehaviorSubject<RealStatus?>)stationConnection.ScrewStatus).Value;
            return this.Json(status);
        }

        [HttpPost("{id}/screwing")]
        public async Task StartScrewing(int id)
        {
            var stationConnection = automationManager.GetStationConnection(id);
            await stationConnection.StartScrewing(3.5, default);
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
    }

