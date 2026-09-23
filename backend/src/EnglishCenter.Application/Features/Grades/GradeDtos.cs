using EnglishCenter.Application.Common.Models;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Application.Features.Grades;

public sealed record GradeSheetDto(
    int ClassId,
    string ClassCode,
    string ClassName,
    GradingScheme GradingScheme,
    ExamType ExamType,
    IReadOnlyList<GradeRowDto> Rows);

public sealed record GradeRowDto(
    int EnrollmentId,
    string StudentCode,
    string StudentName,
    decimal? Listening,
    decimal? Reading,
    decimal? Writing,
    decimal? Speaking,
    decimal? Overall,
    string? Feedback);

public sealed record SaveGradeSheetRequest(int ClassId, ExamType ExamType, IReadOnlyList<GradeEntry> Entries);

/// <summary>Để trống hết điểm và nhận xét sẽ xóa điểm đã lưu của học viên ở kỳ thi này.</summary>
public sealed record GradeEntry(
    int EnrollmentId,
    decimal? Listening,
    decimal? Reading,
    decimal? Writing,
    decimal? Speaking,
    string? Feedback);

public sealed record GradeDto(
    int Id,
    int EnrollmentId,
    string StudentCode,
    string StudentName,
    string ClassCode,
    string CourseName,
    GradingScheme GradingScheme,
    ExamType ExamType,
    decimal? Listening,
    decimal? Reading,
    decimal? Writing,
    decimal? Speaking,
    decimal? Overall,
    string? Feedback);

public sealed record GradeQuery : PageQuery
{
    public int? ClassId { get; init; }
    public ExamType? ExamType { get; init; }
}
