using EnglishCenter.Domain.Common;

namespace EnglishCenter.Domain.Entities;

public class AttendanceRecord : AuditableEntity
{
    public int EnrollmentId { get; set; }
    public Enrollment Enrollment { get; set; } = null!;
    public int SessionNumber { get; set; }
    public DateOnly SessionDate { get; set; }
    public bool IsPresent { get; set; }
    public string? Note { get; set; }
}
