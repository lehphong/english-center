using EnglishCenter.Api.Common;
using EnglishCenter.Application.Common;
using EnglishCenter.Application.Common.Models;
using EnglishCenter.Application.Features.Courses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCenter.Api.Controllers;

[ApiController]
[Route("api/courses")]
[Authorize(Policy = Policies.Staff)]
public sealed class CoursesController(ICourseService courses) : ControllerBase
{
    [HttpGet]
    public Task<PagedResult<CourseDto>> GetPaged([FromQuery] CourseQuery query, CancellationToken cancellationToken) =>
        courses.GetPagedAsync(query, cancellationToken);

    [HttpGet("options")]
    public Task<IReadOnlyList<OptionDto>> GetOptions([FromQuery] bool activeOnly, CancellationToken cancellationToken) =>
        courses.GetOptionsAsync(activeOnly, cancellationToken);

    [HttpGet("{id:int}")]
    public Task<CourseDto> Get(int id, CancellationToken cancellationToken) => courses.GetAsync(id, cancellationToken);

    [HttpPost]
    public async Task<ActionResult<CourseDto>> Create(SaveCourseRequest request, CancellationToken cancellationToken)
    {
        var course = await courses.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = course.Id }, course);
    }

    [HttpPut("{id:int}")]
    public Task<CourseDto> Update(int id, SaveCourseRequest request, CancellationToken cancellationToken) =>
        courses.UpdateAsync(id, request, cancellationToken);

    [HttpPost("{id:int}/thumbnail")]
    [RequestSizeLimit(ValidationRules.MaxImageBytes + 64 * 1024)]
    public Task<CourseDto> UploadThumbnail(int id, IFormFile file, CancellationToken cancellationToken) =>
        courses.UploadThumbnailAsync(id, file.ToFileUpload(), cancellationToken);

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await courses.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
