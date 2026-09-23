using EnglishCenter.Application.Common.Models;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Application.Features.Classes;

public sealed record ClassDto(
    int Id,
    string Code,
    string Name,
    int CourseId,
    string CourseName,
    string? TeacherName,
    string? Schedule,
    string? Room,
    DateOnly StartDate,
    DateOnly? EndDate,
    int MaxCapacity,
    int EnrolledCount);

public sealed record ClassStudentDto(
    int EnrollmentId,
    int StudentId,
    string StudentCode,
    string StudentName,
    LearningStatus LearningStatus,
    PaymentStatus PaymentStatus);

public sealed record SaveClassRequest(
    string Code,
    string Name,
    int CourseId,
    string? TeacherName,
    string? Schedule,
    string? Room,
    DateOnly StartDate,
    DateOnly? EndDate,
    int MaxCapacity);

public sealed record ClassQuery : PageQuery
{
    public int? CourseId { get; init; }
}
