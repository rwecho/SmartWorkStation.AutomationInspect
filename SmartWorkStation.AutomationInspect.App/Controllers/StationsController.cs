using Microsoft.AspNetCore.Mvc;
using SmartWorkStation.AutomationInspect.App.Services;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartWorkStation.AutomationInspect.App.Controllers;


[Route("/api/stations")]
public class StationsController(StationService stationService) : AbpController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Station>>> GetListAsync()
    {
        var stations = await stationService.GetListAsync();
        return Ok(stations);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Station>> GetAsync(int id)
    {
        var station = await stationService.GetAsync(id);
        if (station == null)
        {
            return NotFound();
        }
        return Ok(station);
    }

    [HttpPost]
    public async Task<ActionResult<Station>> CreateAsync([FromBody] Station station)
    {
        try
        {
            var newStation = await stationService.CreateAsync(station);

            return CreatedAtAction(nameof(GetAsync), new { id = station.Id }, newStation);
        }
        catch (Exception exception)
        {
            throw new UserFriendlyException(exception.Message, innerException: exception);
        }
    }

    [HttpPut("{id}")]   
    public async Task<ActionResult<Station>> Update(int id, [FromBody] Station updatedStation)
    {
        if (await stationService.GetAsync(id) == null)
        {
            return NotFound();
        }

        try
        {
            var station = await stationService.UpdateAsync(updatedStation);

            return Ok(station);
        }
        catch (Exception exception)
        {
            throw new UserFriendlyException(exception.Message, innerException: exception);
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            await stationService.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception exception)
        {
            throw new UserFriendlyException(exception.Message, innerException: exception);
        }
    }
}
