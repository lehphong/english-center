using EnglishCenter.Domain.Entities;
using EnglishCenter.Domain.Enums;
using EnglishCenter.Infrastructure.Persistence;
using EnglishCenter.Infrastructure.Persistence.Interceptors;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Time.Testing;

namespace EnglishCenter.UnitTests.TestSupport;

/// <summary>SQLite in-memory: có transaction, khóa ngoại và unique index giống SQL Server.</summary>
public sealed class TestDatabase : IDisposable
{
    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    public TestDatabase()
    {
        _connection.Open();
        using var db = CreateContext();
        db.Database.EnsureCreated();
    }

    public FakeTimeProvider Clock { get; } = new(new DateTimeOffset(2026, 9, 15, 8, 0, 0, TimeSpan.Zero));

    public ApplicationDbContext CreateContext() => new(new DbContextOptionsBuilder<ApplicationDbContext>()
        .UseSqlite(_connection)
        .AddInterceptors(new AuditableEntityInterceptor(Clock))
        .Options);

    public void Dispose() => _connection.Dispose();

    /// <summary>Thêm dữ liệu rồi trả về chính các entity (đã có Id).</summary>
    public T Add<T>(T entity) where T : class
    {
        using var db = CreateContext();
        db.Add(entity);
        db.SaveChanges();
        return entity;
    }

    public Course AddCourse(GradingScheme scheme = GradingScheme.Standard, decimal fee = 5_000_000, int sessions = 24) =>
        Add(new Course { Name = $"Course {Guid.NewGuid():N}", GradingScheme = scheme, TuitionFee = fee, TotalSessions = sessions });

    public CourseClass AddClass(Course course, int maxCapacity = 20, string? code = null) => Add(new CourseClass
    {
        Code = code ?? $"C{Guid.NewGuid():N}"[..10].ToUpperInvariant(),
        Name = "Class",
        CourseId = course.Id,
        StartDate = new DateOnly(2026, 9, 1),
        MaxCapacity = maxCapacity
    });

    public Student AddStudent(string code) => Add(new Student
    {
        Code = code,
        FullName = $"Student {code}",
        Email = $"{code.ToLowerInvariant()}@example.com",
        PhoneNumber = "09" + Random.Shared.Next(10_000_000, 99_999_999)
    });

    public Enrollment AddEnrollment(Student student, CourseClass courseClass, LearningStatus status = LearningStatus.Studying,
        decimal fee = 5_000_000, decimal paid = 0) => Add(new Enrollment
    {
        StudentId = student.Id,
        ClassId = courseClass.Id,
        EnrolledOn = new DateOnly(2026, 9, 1),
        TuitionFee = fee,
        AmountPaid = paid,
        LearningStatus = status
    });
}
