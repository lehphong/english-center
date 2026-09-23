using EnglishCenter.Application.Common.Models;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Application.Features.Users;

public sealed record UserDto(
    int Id,
    string Username,
    UserRole Role,
    bool IsActive,
    int? StudentId,
    string? StudentName,
    DateTimeOffset? LastLoginAt);

public sealed record CreateUserRequest(string Username, string Password, UserRole Role, int? StudentId);

public sealed record UpdateUserRequest(UserRole Role, bool IsActive, int? StudentId);

public sealed record ResetPasswordRequest(string NewPassword);

public sealed record UserQuery : PageQuery
{
    public UserRole? Role { get; init; }
    public bool? IsActive { get; init; }
}
