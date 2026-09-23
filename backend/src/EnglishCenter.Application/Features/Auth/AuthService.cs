using EnglishCenter.Application.Common.Abstractions;
using EnglishCenter.Application.Common.Exceptions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Application.Features.Auth;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<CurrentUserDto> GetCurrentUserAsync(CancellationToken cancellationToken);
    Task ChangePasswordAsync(ChangePasswordRequest request, CancellationToken cancellationToken);
}

internal sealed class AuthService(
    IApplicationDbContext db,
    IPasswordHasher passwordHasher,
    ITokenService tokenService,
    ICurrentUser currentUser,
    TimeProvider clock,
    IValidator<LoginRequest> loginValidator,
    IValidator<ChangePasswordRequest> changePasswordValidator) : IAuthService
{
    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        await loginValidator.ValidateAndThrowAsync(request, cancellationToken);

        var user = await db.Users
            .Include(u => u.Student)
            .SingleOrDefaultAsync(u => u.Username == request.Username.Trim(), cancellationToken);

        // Cùng một thông báo cho sai tên đăng nhập và sai mật khẩu để không lộ tài khoản nào tồn tại
        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("auth.invalidCredentials", "Invalid username or password.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedException("auth.accountLocked", "This account has been locked.");
        }

        user.LastLoginAt = clock.GetUtcNow();
        await db.SaveChangesAsync(cancellationToken);

        var token = tokenService.CreateAccessToken(user, user.Student?.Id);
        return new AuthResponse(token.Token, token.ExpiresAt,
            new CurrentUserDto(user.Id, user.Username, user.Role, user.Student?.Id, user.Student?.FullName));
    }

    public async Task<CurrentUserDto> GetCurrentUserAsync(CancellationToken cancellationToken)
    {
        var userId = RequireUserId();
        return await db.Users
            .Where(u => u.Id == userId)
            .Select(u => new CurrentUserDto(u.Id, u.Username, u.Role,
                u.Student != null ? u.Student.Id : null,
                u.Student != null ? u.Student.FullName : null))
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("user", userId);
    }

    public async Task ChangePasswordAsync(ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        await changePasswordValidator.ValidateAndThrowAsync(request, cancellationToken);

        var userId = RequireUserId();
        var user = await db.Users.FindAsync([userId], cancellationToken) ?? throw new NotFoundException("user", userId);

        if (!passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new ValidationException([new FluentValidation.Results.ValidationFailure(
                nameof(ChangePasswordRequest.CurrentPassword), "Current password is incorrect.") { ErrorCode = "auth.wrongPassword" }]);
        }

        user.PasswordHash = passwordHasher.Hash(request.NewPassword);
        await db.SaveChangesAsync(cancellationToken);
    }

    private int RequireUserId() =>
        currentUser.UserId ?? throw new UnauthorizedException("auth.required", "Authentication is required.");
}
