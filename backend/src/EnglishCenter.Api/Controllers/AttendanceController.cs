using EnglishCenter.Api.Common;
using EnglishCenter.Application.Common.Models;
using EnglishCenter.Application.Features.Attendance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCenter.Api.Controllers;

[ApiController]
[Route("api/attendance")]
[Authorize(Policy = Policies.Staff)]
public sealed class AttendanceController(IAttendanceService attendance) : ControllerBase
{
    [HttpGet]
    public Task<PagedResult<AttendanceRecordDto>> GetPaged([FromQuery] AttendanceQuery query, CancellationToken cancellationToken) =>
        attendance.GetPagedAsync(query, cancellationToken);

    [HttpGet("sheet")]
    public Task<AttendanceSheetDto> GetSheet([FromQuery] int classId, [FromQuery] int sessionNumber, CancellationToken cancellationToken) =>
        attendance.GetSheetAsync(classId, sessionNumber, cancellationToken);

    [HttpPut("sheet")]
    public Task<AttendanceSheetDto> SaveSheet(SaveAttendanceRequest request, CancellationToken cancellationToken) =>
        attendance.SaveSheetAsync(request, cancellationToken);

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await attendance.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
