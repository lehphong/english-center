using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Domain.Entities;

/// <summary>Một lớp mở cho một khóa học (đặt tên CourseClass để tránh nhầm với từ khóa class).</summary>
public class CourseClass : AuditableEntity
{
    /// <summary>Trạng thái học còn giữ chỗ trong lớp. Học viên đã nghỉ / hoàn thành không tính vào sĩ số.</summary>
    public static readonly IReadOnlyCollection<LearningStatus> SeatHoldingStatuses =
        [LearningStatus.Studying, LearningStatus.Deferred];

    public required string Code { get; set; }
    public required string Name { get; set; }
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public string? TeacherName { get; set; }
    public string? Schedule { get; set; }
    public string? Room { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public int MaxCapacity { get; set; }

    public ICollection<Enrollment> Enrollments { get; } = new List<Enrollment>();

    public void EnsureHasSeat(int occupiedSeats)
    {
        if (occupiedSeats >= MaxCapacity)
        {
            throw new DomainException("class.full", $"Class {Code} is full ({MaxCapacity} students).");
        }
    }
}
