using EnglishCenter.Application.Common.Abstractions;
using EnglishCenter.Domain.Entities;
using EnglishCenter.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EnglishCenter.Infrastructure.Persistence.Seeding;

/// <summary>Dữ liệu mẫu cho môi trường phát triển. Chỉ chạy khi database còn trống.</summary>
public sealed class DataSeeder(ApplicationDbContext db, IPasswordHasher passwordHasher, ILogger<DataSeeder> logger)
{
    public const string DefaultPassword = "Passw0rd!";

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (await db.Users.AnyAsync(cancellationToken))
        {
            return;
        }

        var hash = passwordHasher.Hash(DefaultPassword);
        db.Users.AddRange(
            new User { Username = "admin", PasswordHash = hash, Role = UserRole.Admin },
            new User { Username = "staff", PasswordHash = hash, Role = UserRole.Staff });

        var ielts = new Course
        {
            Name = "IELTS Intensive 6.5+", TuitionFee = 8_500_000, TotalSessions = 36, GradingScheme = GradingScheme.Ielts,
            Description = "Luyện 4 kỹ năng IELTS, mục tiêu band 6.5 trở lên."
        };
        var toeic = new Course
        {
            Name = "TOEIC 650+", TuitionFee = 5_000_000, TotalSessions = 24, GradingScheme = GradingScheme.Toeic,
            Description = "Luyện đề TOEIC Listening & Reading."
        };
        var communication = new Course
        {
            Name = "Giao tiếp cơ bản", TuitionFee = 3_500_000, TotalSessions = 20, GradingScheme = GradingScheme.Standard,
            Description = "Phản xạ giao tiếp cho người mới bắt đầu."
        };

        var ieltsClass = new CourseClass
        {
            Code = "IELTS-2601", Name = "IELTS tối 2-4-6", Course = ielts, TeacherName = "Nguyễn Mai Hương",
            Schedule = "T2-T4-T6 18:00-20:00", Room = "P201", StartDate = new DateOnly(2026, 9, 7), MaxCapacity = 15
        };
        var toeicClass = new CourseClass
        {
            Code = "TOEIC-2601", Name = "TOEIC tối 3-5-7", Course = toeic, TeacherName = "John Smith",
            Schedule = "T3-T5-T7 18:00-20:00", Room = "P105", StartDate = new DateOnly(2026, 9, 8), MaxCapacity = 20
        };
        var communicationClass = new CourseClass
        {
            Code = "GT-2601", Name = "Giao tiếp cuối tuần", Course = communication, TeacherName = "Trần Minh Đức",
            Schedule = "T7-CN 09:00-11:00", Room = "P301", StartDate = new DateOnly(2026, 9, 12), MaxCapacity = 12
        };

        var an = NewStudent("HV001", "Nguyễn Văn An", "an.nguyen@example.com", "0912345678", EnglishLevel.Intermediate);
        an.User = new User { Username = "hv001", PasswordHash = hash, Role = UserRole.Student };
        var binh = NewStudent("HV002", "Trần Thị Bình", "binh.tran@example.com", "0987654321", EnglishLevel.Elementary);
        var cuong = NewStudent("HV003", "Lê Hoàng Cường", "cuong.le@example.com", "0901234567", EnglishLevel.Beginner);

        db.Enrollments.AddRange(
            new Enrollment { Student = an, Class = ieltsClass, EnrolledOn = new DateOnly(2026, 9, 1), TuitionFee = 8_500_000, AmountPaid = 8_500_000 },
            new Enrollment { Student = binh, Class = toeicClass, EnrolledOn = new DateOnly(2026, 9, 2), TuitionFee = 5_000_000, AmountPaid = 2_000_000 },
            new Enrollment { Student = cuong, Class = communicationClass, EnrolledOn = new DateOnly(2026, 9, 3), TuitionFee = 3_500_000 },
            new Enrollment { Student = an, Class = communicationClass, EnrolledOn = new DateOnly(2026, 9, 3), TuitionFee = 3_000_000, AmountPaid = 3_000_000 });

        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded sample data. Default password for admin / staff / hv001: {Password}", DefaultPassword);
    }

    private static Student NewStudent(string code, string name, string email, string phone, EnglishLevel level) => new()
    {
        Code = code, FullName = name, Email = email, PhoneNumber = phone, EntryLevel = level,
        Gender = name.Contains("Thị", StringComparison.Ordinal) ? Gender.Female : Gender.Male
    };
}
