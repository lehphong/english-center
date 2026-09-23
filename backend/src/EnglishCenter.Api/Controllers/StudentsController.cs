using EnglishCenter.Api.Common;
using EnglishCenter.Application.Common;
using EnglishCenter.Application.Common.Models;
using EnglishCenter.Application.Features.Students;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCenter.Api.Controllers;

[ApiController]
[Route("api/students")]
[Authorize(Policy = Policies.Staff)]
public sealed class StudentsController(IStudentService students) : ControllerBase
{
    [HttpGet]
    public Task<PagedResult<StudentDto>> GetPaged([FromQuery] StudentQuery query, CancellationToken cancellationToken) =>
        students.GetPagedAsync(query, cancellationToken);

    [HttpGet("options")]
    public Task<IReadOnlyList<OptionDto>> GetOptions([FromQuery] bool withoutAccountOnly, CancellationToken cancellationToken) =>
        students.GetOptionsAsync(withoutAccountOnly, cancellationToken);

    [HttpGet("{id:int}")]
    public Task<StudentDto> Get(int id, CancellationToken cancellationToken) => students.GetAsync(id, cancellationToken);

    [HttpGet("{id:int}/enrollments")]
    public Task<IReadOnlyList<StudentEnrollmentDto>> GetEnrollments(int id, CancellationToken cancellationToken) =>
        students.GetEnrollmentsAsync(id, cancellationToken);

    [HttpPost]
    public async Task<ActionResult<StudentDto>> Create(CreateStudentRequest request, CancellationToken cancellationToken)
    {
        var created = await students.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public Task<StudentDto> Update(int id, SaveStudentRequest request, CancellationToken cancellationToken) =>
        students.UpdateAsync(id, request, cancellationToken);

    [HttpPost("{id:int}/avatar")]
    [RequestSizeLimit(ValidationRules.MaxImageBytes + 64 * 1024)]
    public Task<StudentDto> UploadAvatar(int id, IFormFile file, CancellationToken cancellationToken) =>
        students.UploadAvatarAsync(id, file.ToFileUpload(), cancellationToken);

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await students.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
