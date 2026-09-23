using EnglishCenter.Application.Common.Abstractions;
using EnglishCenter.Application.Common.Exceptions;
using EnglishCenter.Application.Common.Extensions;
using EnglishCenter.Application.Features.Students;
using EnglishCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Application.Features.Portal;

/// <summary>Các màn hình tự tra cứu của học viên: chỉ đọc dữ liệu của chính học viên đang đăng nhập.</summary>
public interface IPortalService
{
    Task<StudentDto> GetProfileAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<MyClassDto>> GetClassesAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<MyAttendanceDto>> GetAttendanceAsync(int? enrollmentId, CancellationToken cancellationToken);
    Task<IReadOnlyList<MyGradeDto>> GetGradesAsync(int? enrollmentId, CancellationToken cancellationToken);
}

internal sealed class PortalService(IApplicationDbContext db, ICurrentUser currentUser, IStudentService students)
    : IPortalService
{
    public async Task<StudentDto> GetProfileAsync(CancellationToken cancellationToken) =>
        await students.GetAsync(await GetStudentIdAsync(cancellationToken), cancellationToken);

    public async Task<IReadOnlyList<MyClassDto>> GetClassesAsync(CancellationToken cancellationToken)
    {
        var studentId = await GetStudentIdAsync(cancellationToken);

        var rows = await db.Enrollments.AsNoTracking()
            .Where(e => e.StudentId == studentId)
            .OrderByDescending(e => e.Class.StartDate)
            .Select(e => new
            {
                e.Id, e.Class.Code, e.Class.Name, CourseName = e.Class.Course.Name, e.Class.TeacherName, e.Class.Schedule,
                e.Class.Room, e.Class.StartDate, e.Class.EndDate, e.Class.Course.TotalSessions, e.LearningStatus,
                e.TuitionFee, e.AmountPaid,
                Attended = e.AttendanceRecords.Count(a => a.IsPresent),
                Recorded = e.AttendanceRecords.Count
            })
            .ToListAsync(cancellationToken);

        return rows.Select(r => new MyClassDto(r.Id, r.Code, r.Name, r.CourseName, r.TeacherName, r.Schedule, r.Room,
            r.StartDate, r.EndDate, r.TotalSessions, r.LearningStatus, Enrollment.GetPaymentStatus(r.TuitionFee, r.AmountPaid),
            Math.Max(r.TuitionFee - r.AmountPaid, 0), r.Attended, r.Recorded)).ToList();
    }

    public async Task<IReadOnlyList<MyAttendanceDto>> GetAttendanceAsync(int? enrollmentId, CancellationToken cancellationToken)
    {
        var studentId = await GetStudentIdAsync(cancellationToken);

        return await db.AttendanceRecords.AsNoTracking()
            .Where(a => a.Enrollment.StudentId == studentId)
            .WhereIf(enrollmentId.HasValue, a => a.EnrollmentId == enrollmentId)
            .OrderByDescending(a => a.SessionDate)
            .Select(a => new MyAttendanceDto(a.EnrollmentId, a.Enrollment.Class.Code, a.SessionNumber, a.SessionDate,
                a.IsPresent, a.Note))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MyGradeDto>> GetGradesAsync(int? enrollmentId, CancellationToken cancellationToken)
    {
        var studentId = await GetStudentIdAsync(cancellationToken);

        return await db.Grades.AsNoTracking()
            .Where(g => g.Enrollment.StudentId == studentId)
            .WhereIf(enrollmentId.HasValue, g => g.EnrollmentId == enrollmentId)
            .OrderBy(g => g.Enrollment.Class.Code).ThenBy(g => g.ExamType)
            .Select(g => new MyGradeDto(g.EnrollmentId, g.Enrollment.Class.Code, g.Enrollment.Class.Course.Name,
                g.Enrollment.Class.Course.GradingScheme, g.ExamType, g.Listening, g.Reading, g.Writing, g.Speaking,
                g.Overall, g.Feedback))
            .ToListAsync(cancellationToken);
    }

    private async Task<int> GetStudentIdAsync(CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId ?? throw new UnauthorizedException("auth.required", "Authentication is required.");

        return await db.Students.Where(s => s.UserId == userId).Select(s => (int?)s.Id).SingleOrDefaultAsync(cancellationToken)
            ?? throw new ForbiddenException("portal.noStudentProfile", "This account is not linked to a student profile.");
    }
}
