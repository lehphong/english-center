using EnglishCenter.Api.Common;
using EnglishCenter.Application.Features.Portal;
using EnglishCenter.Application.Features.Students;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCenter.Api.Controllers;

/// <summary>Cổng tra cứu của học viên đang đăng nhập.</summary>
[ApiController]
[Route("api/portal")]
[Authorize(Policy = Policies.Student)]
public sealed class PortalController(IPortalService portal) : ControllerBase
{
    [HttpGet("profile")]
    public Task<StudentDto> GetProfile(CancellationToken cancellationToken) => portal.GetProfileAsync(cancellationToken);

    [HttpGet("classes")]
    public Task<IReadOnlyList<MyClassDto>> GetClasses(CancellationToken cancellationToken) =>
        portal.GetClassesAsync(cancellationToken);

    [HttpGet("attendance")]
    public Task<IReadOnlyList<MyAttendanceDto>> GetAttendance([FromQuery] int? enrollmentId, CancellationToken cancellationToken) =>
        portal.GetAttendanceAsync(enrollmentId, cancellationToken);

    [HttpGet("grades")]
    public Task<IReadOnlyList<MyGradeDto>> GetGrades([FromQuery] int? enrollmentId, CancellationToken cancellationToken) =>
        portal.GetGradesAsync(enrollmentId, cancellationToken);
}
