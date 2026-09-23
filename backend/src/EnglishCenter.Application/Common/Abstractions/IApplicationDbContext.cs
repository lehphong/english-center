using EnglishCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Application.Common.Abstractions;

public interface IApplicationDbContext
{
    DbSet<Course> Courses { get; }
    DbSet<CourseClass> Classes { get; }
    DbSet<Student> Students { get; }
    DbSet<User> Users { get; }
    DbSet<Enrollment> Enrollments { get; }
    DbSet<AttendanceRecord> AttendanceRecords { get; }
    DbSet<Grade> Grades { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
