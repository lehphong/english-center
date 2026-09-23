using EnglishCenter.Application.Common.Models;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Application.Features.Students;

public sealed record StudentDto(
    int Id,
    string Code,
    string FullName,
    DateOnly? DateOfBirth,
    Gender Gender,
    string Email,
    string PhoneNumber,
    string? Address,
    string? AvatarUrl,
    EnglishLevel EntryLevel,
    int? UserId,
    string? Username,
    int EnrollmentCount);

public sealed record StudentEnrollmentDto(
    int EnrollmentId,
    int ClassId,
    string ClassCode,
    string ClassName,
    string CourseName,
    LearningStatus LearningStatus,
    PaymentStatus PaymentStatus);

public record SaveStudentRequest
{
    public required string Code { get; init; }
    public required string FullName { get; init; }
    public DateOnly? DateOfBirth { get; init; }
    public Gender Gender { get; init; }
    public required string Email { get; init; }
    public required string PhoneNumber { get; init; }
    public string? Address { get; init; }
    public EnglishLevel EntryLevel { get; init; }
}

/// <summary>Tạo học viên, có thể kèm tài khoản đăng nhập (vai trò Student).</summary>
public sealed record CreateStudentRequest : SaveStudentRequest
{
    public bool CreateAccount { get; init; }

    /// <summary>Mặc định lấy theo mã học viên (chữ thường) khi bỏ trống.</summary>
    public string? Username { get; init; }

    public string? Password { get; init; }
}

public sealed record StudentQuery : PageQuery
{
    public EnglishLevel? EntryLevel { get; init; }
    public bool? HasAccount { get; init; }
}
