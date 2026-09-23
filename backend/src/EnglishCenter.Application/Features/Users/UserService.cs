using System.Linq.Expressions;
using EnglishCenter.Application.Common.Abstractions;
using EnglishCenter.Application.Common.Exceptions;
using EnglishCenter.Application.Common.Extensions;
using EnglishCenter.Application.Common.Models;
using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Entities;
using EnglishCenter.Domain.Enums;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Application.Features.Users;

public interface IUserService
{
    Task<PagedResult<UserDto>> GetPagedAsync(UserQuery query, CancellationToken cancellationToken);
    Task<UserDto> GetAsync(int id, CancellationToken cancellationToken);
    Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken);
    Task<UserDto> UpdateAsync(int id, UpdateUserRequest request, CancellationToken cancellationToken);
    Task ResetPasswordAsync(int id, ResetPasswordRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(int id, CancellationToken cancellationToken);
}

internal sealed class UserService(
    IApplicationDbContext db,
    IPasswordHasher passwordHasher,
    ICurrentUser currentUser,
    IValidator<CreateUserRequest> createValidator,
    IValidator<UpdateUserRequest> updateValidator,
    IValidator<ResetPasswordRequest> resetValidator) : IUserService
{
    private static readonly Expression<Func<User, UserDto>> ToDto = u => new UserDto(
        u.Id, u.Username, u.Role, u.IsActive,
        u.Student != null ? u.Student.Id : null,
        u.Student != null ? u.Student.FullName : null,
        u.LastLoginAt);

    public Task<PagedResult<UserDto>> GetPagedAsync(UserQuery query, CancellationToken cancellationToken) =>
        db.Users.AsNoTracking()
            .WhereIf(query.Term != null, u => u.Username.Contains(query.Term!)
                || (u.Student != null && (u.Student.FullName.Contains(query.Term!) || u.Student.Code.Contains(query.Term!))))
            .WhereIf(query.Role.HasValue, u => u.Role == query.Role)
            .WhereIf(query.IsActive.HasValue, u => u.IsActive == query.IsActive)
            .OrderBy(u => u.Role).ThenBy(u => u.Username)
            .Select(ToDto)
            .ToPagedResultAsync(query, cancellationToken);

    public async Task<UserDto> GetAsync(int id, CancellationToken cancellationToken) =>
        await db.Users.AsNoTracking().Where(u => u.Id == id).Select(ToDto).SingleOrDefaultAsync(cancellationToken)
        ?? throw new NotFoundException("user", id);

    public async Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken)
    {
        await createValidator.ValidateAndThrowAsync(request, cancellationToken);

        var username = request.Username.Trim();
        if (await db.Users.AnyAsync(u => u.Username == username, cancellationToken))
        {
            throw new ConflictException("user.duplicateUsername", $"Username '{username}' is already taken.");
        }

        var user = new User
        {
            Username = username,
            PasswordHash = passwordHasher.Hash(request.Password),
            Role = request.Role
        };

        if (request.Role == UserRole.Student)
        {
            var student = await FindLinkableStudentAsync(request.StudentId!.Value, null, cancellationToken);
            student.User = user;
        }

        db.Users.Add(user);
        await db.SaveChangesAsync(cancellationToken);

        return await GetAsync(user.Id, cancellationToken);
    }

    public async Task<UserDto> UpdateAsync(int id, UpdateUserRequest request, CancellationToken cancellationToken)
    {
        await updateValidator.ValidateAndThrowAsync(request, cancellationToken);
        var user = await FindAsync(id, cancellationToken);

        if (user.Id == currentUser.UserId && (request.Role != user.Role || !request.IsActive))
        {
            throw new DomainException("user.cannotModifySelf", "You cannot change the role or lock your own account.");
        }

        if (user.Role == UserRole.Admin && (request.Role != UserRole.Admin || !request.IsActive))
        {
            await EnsureAnotherActiveAdminAsync(user.Id, cancellationToken);
        }

        var linkedStudentId = request.Role == UserRole.Student ? request.StudentId : null;
        if (user.Student is not null && user.Student.Id != linkedStudentId)
        {
            user.Student.UserId = null;
        }
        if (linkedStudentId is { } studentId && user.Student?.Id != studentId)
        {
            var student = await FindLinkableStudentAsync(studentId, user.Id, cancellationToken);
            student.UserId = user.Id;
        }

        user.Role = request.Role;
        user.IsActive = request.IsActive;
        await db.SaveChangesAsync(cancellationToken);

        return await GetAsync(id, cancellationToken);
    }

    public async Task ResetPasswordAsync(int id, ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        await resetValidator.ValidateAndThrowAsync(request, cancellationToken);
        var user = await FindAsync(id, cancellationToken);

        user.PasswordHash = passwordHasher.Hash(request.NewPassword);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var user = await FindAsync(id, cancellationToken);

        if (user.Id == currentUser.UserId)
        {
            throw new DomainException("user.cannotModifySelf", "You cannot delete your own account.");
        }
        if (user.Role == UserRole.Admin)
        {
            await EnsureAnotherActiveAdminAsync(user.Id, cancellationToken);
        }

        // Hồ sơ học viên được giữ lại, chỉ gỡ liên kết với tài khoản
        if (user.Student is not null)
        {
            user.Student.UserId = null;
        }

        db.Users.Remove(user);
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task<User> FindAsync(int id, CancellationToken cancellationToken) =>
        await db.Users.Include(u => u.Student).SingleOrDefaultAsync(u => u.Id == id, cancellationToken)
        ?? throw new NotFoundException("user", id);

    private async Task<Student> FindLinkableStudentAsync(int studentId, int? userId, CancellationToken cancellationToken)
    {
        var student = await db.Students.FindAsync([studentId], cancellationToken)
            ?? throw new NotFoundException("student", studentId);

        if (student.UserId is not null && student.UserId != userId)
        {
            throw new ConflictException("user.studentAlreadyLinked", "This student already has another account.");
        }
        return student;
    }

    private async Task EnsureAnotherActiveAdminAsync(int userId, CancellationToken cancellationToken)
    {
        if (!await db.Users.AnyAsync(u => u.Role == UserRole.Admin && u.IsActive && u.Id != userId, cancellationToken))
        {
            throw new DomainException("user.lastAdmin", "At least one active administrator is required.");
        }
    }
}
