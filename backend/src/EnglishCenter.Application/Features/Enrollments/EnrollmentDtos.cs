using EnglishCenter.Application.Common.Models;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Application.Features.Enrollments;

public sealed record EnrollmentDto(
    int Id,
    int StudentId,
    string StudentCode,
    string StudentName,
    int ClassId,
    string ClassCode,
    string ClassName,
    string CourseName,
    DateOnly EnrolledOn,
    decimal TuitionFee,
    decimal AmountPaid,
    decimal Balance,
    PaymentStatus PaymentStatus,
    LearningStatus LearningStatus);

/// <summary>Học phí bỏ trống sẽ lấy theo học phí niêm yết của khóa học.</summary>
public sealed record CreateEnrollmentRequest(
    int StudentId,
    int ClassId,
    DateOnly? EnrolledOn,
    decimal? TuitionFee,
    decimal AmountPaid);

public sealed record UpdateEnrollmentRequest(decimal TuitionFee, decimal AmountPaid, LearningStatus LearningStatus);

public sealed record EnrollmentQuery : PageQuery
{
    public int? ClassId { get; init; }
    public int? StudentId { get; init; }
    public PaymentStatus? PaymentStatus { get; init; }
    public LearningStatus? LearningStatus { get; init; }
}
