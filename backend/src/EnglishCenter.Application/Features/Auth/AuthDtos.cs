using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Application.Features.Auth;

public sealed record LoginRequest(string Username, string Password);

public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public sealed record CurrentUserDto(int Id, string Username, UserRole Role, int? StudentId, string? FullName);

public sealed record AuthResponse(string AccessToken, DateTimeOffset ExpiresAt, CurrentUserDto User);
