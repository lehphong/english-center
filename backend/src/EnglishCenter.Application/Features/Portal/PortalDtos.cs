using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Application.Features.Portal;

public sealed record MyClassDto(
    int EnrollmentId,
    string ClassCode,
    string ClassName,
    string CourseName,
    string? TeacherName,
    string? Schedule,
    string? Room,
    DateOnly StartDate,
    DateOnly? EndDate,
    int TotalSessions,
    LearningStatus LearningStatus,
    PaymentStatus PaymentStatus,
    decimal Balance,
    int SessionsAttended,
    int SessionsRecorded);

public sealed record MyAttendanceDto(
    int EnrollmentId,
    string ClassCode,
    int SessionNumber,
    DateOnly SessionDate,
    bool IsPresent,
    string? Note);

public sealed record MyGradeDto(
    int EnrollmentId,
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
