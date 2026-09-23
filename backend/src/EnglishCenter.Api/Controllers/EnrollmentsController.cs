using EnglishCenter.Api.Common;
using EnglishCenter.Application.Common.Models;
using EnglishCenter.Application.Features.Enrollments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCenter.Api.Controllers;

[ApiController]
[Route("api/enrollments")]
[Authorize(Policy = Policies.Staff)]
public sealed class EnrollmentsController(IEnrollmentService enrollments) : ControllerBase
{
    [HttpGet]
    public Task<PagedResult<EnrollmentDto>> GetPaged([FromQuery] EnrollmentQuery query, CancellationToken cancellationToken) =>
        enrollments.GetPagedAsync(query, cancellationToken);

    [HttpGet("{id:int}")]
    public Task<EnrollmentDto> Get(int id, CancellationToken cancellationToken) => enrollments.GetAsync(id, cancellationToken);

    [HttpPost]
    public async Task<ActionResult<EnrollmentDto>> Create(CreateEnrollmentRequest request, CancellationToken cancellationToken)
    {
        var created = await enrollments.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public Task<EnrollmentDto> Update(int id, UpdateEnrollmentRequest request, CancellationToken cancellationToken) =>
        enrollments.UpdateAsync(id, request, cancellationToken);

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await enrollments.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
