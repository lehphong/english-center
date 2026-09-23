using EnglishCenter.Api.Common;
using EnglishCenter.Application.Common.Models;
using EnglishCenter.Application.Features.Classes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCenter.Api.Controllers;

[ApiController]
[Route("api/classes")]
[Authorize(Policy = Policies.Staff)]
public sealed class ClassesController(IClassService classes) : ControllerBase
{
    [HttpGet]
    public Task<PagedResult<ClassDto>> GetPaged([FromQuery] ClassQuery query, CancellationToken cancellationToken) =>
        classes.GetPagedAsync(query, cancellationToken);

    [HttpGet("options")]
    public Task<IReadOnlyList<OptionDto>> GetOptions(CancellationToken cancellationToken) =>
        classes.GetOptionsAsync(cancellationToken);

    [HttpGet("{id:int}")]
    public Task<ClassDto> Get(int id, CancellationToken cancellationToken) => classes.GetAsync(id, cancellationToken);

    [HttpGet("{id:int}/students")]
    public Task<IReadOnlyList<ClassStudentDto>> GetStudents(int id, CancellationToken cancellationToken) =>
        classes.GetStudentsAsync(id, cancellationToken);

    [HttpPost]
    public async Task<ActionResult<ClassDto>> Create(SaveClassRequest request, CancellationToken cancellationToken)
    {
        var created = await classes.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public Task<ClassDto> Update(int id, SaveClassRequest request, CancellationToken cancellationToken) =>
        classes.UpdateAsync(id, request, cancellationToken);

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await classes.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
