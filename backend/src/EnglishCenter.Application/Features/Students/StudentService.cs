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

namespace EnglishCenter.Application.Features.Students;

public interface IStudentService
{
    Task<PagedResult<StudentDto>> GetPagedAsync(StudentQuery query, CancellationToken cancellationToken);
    Task<StudentDto> GetAsync(int id, CancellationToken cancellationToken);
    Task<IReadOnlyList<OptionDto>> GetOptionsAsync(bool withoutAccountOnly, CancellationToken cancellationToken);
    Task<IReadOnlyList<StudentEnrollmentDto>> GetEnrollmentsAsync(int id, CancellationToken cancellationToken);
    Task<StudentDto> CreateAsync(CreateStudentRequest request, CancellationToken cancellationToken);
    Task<StudentDto> UpdateAsync(int id, SaveStudentRequest request, CancellationToken cancellationToken);
    Task<StudentDto> UploadAvatarAsync(int id, FileUpload file, CancellationToken cancellationToken);
    Task DeleteAsync(int id, CancellationToken cancellationToken);
}

internal sealed class StudentService(
    IApplicationDbContext db,
    IPasswordHasher passwordHasher,
    IFileStorage fileStorage,
    IValidator<CreateStudentRequest> createValidator,
    IValidator<SaveStudentRequest> updateValidator,
    IValidator<FileUpload> imageValidator) : IStudentService
{
    private static readonly Expression<Func<Student, StudentDto>> ToDto = s => new StudentDto(
        s.Id, s.Code, s.FullName, s.DateOfBirth, s.Gender, s.Email, s.PhoneNumber, s.Address, s.AvatarUrl,
        s.EntryLevel, s.UserId, s.User != null ? s.User.Username : null, s.Enrollments.Count);

    public Task<PagedResult<StudentDto>> GetPagedAsync(StudentQuery query, CancellationToken cancellationToken) =>
        db.Students.AsNoTracking()
            .WhereIf(query.Term != null, s => s.Code.Contains(query.Term!) || s.FullName.Contains(query.Term!)
                || s.Email.Contains(query.Term!) || s.PhoneNumber.Contains(query.Term!))
            .WhereIf(query.EntryLevel.HasValue, s => s.EntryLevel == query.EntryLevel)
            .WhereIf(query.HasAccount.HasValue, s => (s.UserId != null) == query.HasAccount)
            .OrderByDescending(s => s.Id)
            .Select(ToDto)
            .ToPagedResultAsync(query, cancellationToken);

    public async Task<StudentDto> GetAsync(int id, CancellationToken cancellationToken) =>
        await db.Students.AsNoTracking().Where(s => s.Id == id).Select(ToDto).SingleOrDefaultAsync(cancellationToken)
        ?? throw new NotFoundException("student", id);

    public async Task<IReadOnlyList<OptionDto>> GetOptionsAsync(bool withoutAccountOnly, CancellationToken cancellationToken) =>
        await db.Students.AsNoTracking()
            .WhereIf(withoutAccountOnly, s => s.UserId == null)
            .OrderBy(s => s.FullName)
            .Select(s => new OptionDto(s.Id, s.Code + " - " + s.FullName))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<StudentEnrollmentDto>> GetEnrollmentsAsync(int id, CancellationToken cancellationToken)
    {
        if (!await db.Students.AnyAsync(s => s.Id == id, cancellationToken))
        {
            throw new NotFoundException("student", id);
        }

        var rows = await db.Enrollments.AsNoTracking()
            .Where(e => e.StudentId == id)
            .OrderByDescending(e => e.EnrolledOn)
            .Select(e => new
            {
                e.Id, e.ClassId, e.Class.Code, e.Class.Name, CourseName = e.Class.Course.Name,
                e.LearningStatus, e.TuitionFee, e.AmountPaid
            })
            .ToListAsync(cancellationToken);

        return rows.Select(r => new StudentEnrollmentDto(r.Id, r.ClassId, r.Code, r.Name, r.CourseName,
            r.LearningStatus, Enrollment.GetPaymentStatus(r.TuitionFee, r.AmountPaid))).ToList();
    }

    public async Task<StudentDto> CreateAsync(CreateStudentRequest request, CancellationToken cancellationToken)
    {
        await createValidator.ValidateAndThrowAsync(request, cancellationToken);
        await EnsureUniqueAsync(null, request, cancellationToken);

        var student = new Student
        {
            Code = request.Code, FullName = request.FullName, Email = request.Email, PhoneNumber = request.PhoneNumber
        };
        Apply(student, request);

        if (request.CreateAccount)
        {
            var username = string.IsNullOrWhiteSpace(request.Username)
                ? student.Code.ToLowerInvariant()
                : request.Username.Trim();

            if (await db.Users.AnyAsync(u => u.Username == username, cancellationToken))
            {
                throw new ConflictException("user.duplicateUsername", $"Username '{username}' is already taken.");
            }

            // Học viên và tài khoản được thêm trong cùng một SaveChanges nên lưu cùng một transaction
            student.User = new User
            {
                Username = username,
                PasswordHash = passwordHasher.Hash(request.Password!),
                Role = UserRole.Student
            };
        }

        db.Students.Add(student);
        await db.SaveChangesAsync(cancellationToken);

        return await GetAsync(student.Id, cancellationToken);
    }

    public async Task<StudentDto> UpdateAsync(int id, SaveStudentRequest request, CancellationToken cancellationToken)
    {
        await updateValidator.ValidateAndThrowAsync(request, cancellationToken);
        var student = await FindAsync(id, cancellationToken);
        await EnsureUniqueAsync(id, request, cancellationToken);

        Apply(student, request);
        await db.SaveChangesAsync(cancellationToken);

        return await GetAsync(id, cancellationToken);
    }

    public async Task<StudentDto> UploadAvatarAsync(int id, FileUpload file, CancellationToken cancellationToken)
    {
        await imageValidator.ValidateAndThrowAsync(file, cancellationToken);

        var student = await FindAsync(id, cancellationToken);
        var previous = student.AvatarUrl;
        student.AvatarUrl = await fileStorage.SaveAsync(file.Content, file.FileName, "avatars", cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
        await fileStorage.DeleteAsync(previous, cancellationToken);

        return await GetAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var student = await db.Students.Include(s => s.User).SingleOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new NotFoundException("student", id);

        if (await db.Enrollments.AnyAsync(e => e.StudentId == id, cancellationToken))
        {
            throw new DomainException("student.hasEnrollments", "The student cannot be deleted because they have enrollments.");
        }

        // Tài khoản đăng nhập của học viên không còn ý nghĩa khi hồ sơ bị xóa
        if (student.User is not null)
        {
            db.Users.Remove(student.User);
        }

        db.Students.Remove(student);
        await db.SaveChangesAsync(cancellationToken);
        await fileStorage.DeleteAsync(student.AvatarUrl, cancellationToken);
    }

    private async Task<Student> FindAsync(int id, CancellationToken cancellationToken) =>
        await db.Students.FindAsync([id], cancellationToken) ?? throw new NotFoundException("student", id);

    private async Task EnsureUniqueAsync(int? id, SaveStudentRequest request, CancellationToken cancellationToken)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        var email = request.Email.Trim().ToLowerInvariant();

        if (await db.Students.AnyAsync(s => s.Code == code && s.Id != id, cancellationToken))
        {
            throw new ConflictException("student.duplicateCode", $"Student code '{code}' already exists.");
        }
        if (await db.Students.AnyAsync(s => s.Email == email && s.Id != id, cancellationToken))
        {
            throw new ConflictException("student.duplicateEmail", $"Email '{email}' is already used by another student.");
        }
        if (await db.Students.AnyAsync(s => s.PhoneNumber == request.PhoneNumber && s.Id != id, cancellationToken))
        {
            throw new ConflictException("student.duplicatePhone", "Phone number is already used by another student.");
        }
    }

    private static void Apply(Student student, SaveStudentRequest request)
    {
        student.Code = request.Code.Trim().ToUpperInvariant();
        student.FullName = request.FullName.Trim();
        student.DateOfBirth = request.DateOfBirth;
        student.Gender = request.Gender;
        student.Email = request.Email.Trim().ToLowerInvariant();
        student.PhoneNumber = request.PhoneNumber.Trim();
        student.Address = request.Address?.Trim();
        student.EntryLevel = request.EntryLevel;
    }
}
