using EnglishCenter.Api.Common;
using EnglishCenter.Application.Common.Models;
using EnglishCenter.Application.Features.Grades;
using EnglishCenter.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCenter.Api.Controllers;

[ApiController]
[Route("api/grades")]
[Authorize(Policy = Policies.Staff)]
public sealed class GradesController(IGradeService grades) : ControllerBase
{
    [HttpGet]
    public Task<PagedResult<GradeDto>> GetPaged([FromQuery] GradeQuery query, CancellationToken cancellationToken) =>
        grades.GetPagedAsync(query, cancellationToken);

    [HttpGet("sheet")]
    public Task<GradeSheetDto> GetSheet([FromQuery] int classId, [FromQuery] ExamType examType, CancellationToken cancellationToken) =>
        grades.GetSheetAsync(classId, examType, cancellationToken);

    [HttpPut("sheet")]
    public Task<GradeSheetDto> SaveSheet(SaveGradeSheetRequest request, CancellationToken cancellationToken) =>
        grades.SaveSheetAsync(request, cancellationToken);

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await grades.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
