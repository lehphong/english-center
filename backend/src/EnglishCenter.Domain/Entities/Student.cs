using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Domain.Entities;

public class Student : AuditableEntity
{
    public required string Code { get; set; }
    public required string FullName { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public required string Email { get; set; }
    public required string PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? AvatarUrl { get; set; }
    public EnglishLevel EntryLevel { get; set; }

    public int? UserId { get; set; }
    public User? User { get; set; }

    public ICollection<Enrollment> Enrollments { get; } = new List<Enrollment>();
}
