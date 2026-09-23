using EnglishCenter.Api.Common;
using EnglishCenter.Application.Common.Models;
using EnglishCenter.Application.Features.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCenter.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Policy = Policies.Admin)]
public sealed class UsersController(IUserService users) : ControllerBase
{
    [HttpGet]
    public Task<PagedResult<UserDto>> GetPaged([FromQuery] UserQuery query, CancellationToken cancellationToken) =>
        users.GetPagedAsync(query, cancellationToken);

    [HttpGet("{id:int}")]
    public Task<UserDto> Get(int id, CancellationToken cancellationToken) => users.GetAsync(id, cancellationToken);

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(CreateUserRequest request, CancellationToken cancellationToken)
    {
        var created = await users.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public Task<UserDto> Update(int id, UpdateUserRequest request, CancellationToken cancellationToken) =>
        users.UpdateAsync(id, request, cancellationToken);

    [HttpPost("{id:int}/reset-password")]
    public async Task<IActionResult> ResetPassword(int id, ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        await users.ResetPasswordAsync(id, request, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await users.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
