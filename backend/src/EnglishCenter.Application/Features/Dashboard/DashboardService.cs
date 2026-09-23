using EnglishCenter.Application.Common.Abstractions;
using EnglishCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Application.Features.Dashboard;

public sealed record DashboardDto(
    int ActiveCourses,
    int OpenClasses,
    int Students,
    int ActiveEnrollments,
    decimal CollectedTuition,
    decimal OutstandingTuition,
    IReadOnlyList<ClassOccupancyDto> OpenClassOccupancy);

public sealed record ClassOccupancyDto(int ClassId, string ClassCode, string ClassName, int Enrolled, int MaxCapacity);

public interface IDashboardService
{
    Task<DashboardDto> GetAsync(CancellationToken cancellationToken);
}

internal sealed class DashboardService(IApplicationDbContext db, TimeProvider clock) : IDashboardService
{
    public async Task<DashboardDto> GetAsync(CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(clock.GetLocalNow().DateTime);
        var seatHolding = CourseClass.SeatHoldingStatuses;

        var occupancy = await db.Classes.AsNoTracking()
            .Where(c => c.EndDate == null || c.EndDate >= today)
            .OrderBy(c => c.StartDate)
            .Select(c => new ClassOccupancyDto(c.Id, c.Code, c.Name,
                c.Enrollments.Count(e => seatHolding.Contains(e.LearningStatus)), c.MaxCapacity))
            .ToListAsync(cancellationToken);

        // Tính tổng học phí phía ứng dụng vì SQLite (dùng khi test) không tổng hợp được kiểu decimal
        var fees = await db.Enrollments.AsNoTracking()
            .Where(e => seatHolding.Contains(e.LearningStatus))
            .Select(e => new { e.TuitionFee, e.AmountPaid })
            .ToListAsync(cancellationToken);

        return new DashboardDto(
            await db.Courses.CountAsync(c => c.IsActive, cancellationToken),
            occupancy.Count,
            await db.Students.CountAsync(cancellationToken),
            fees.Count,
            fees.Sum(f => f.AmountPaid),
            fees.Sum(f => Math.Max(f.TuitionFee - f.AmountPaid, 0)),
            occupancy);
    }
}
