using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Domain.Entities;

public class Grade : AuditableEntity
{
    public int EnrollmentId { get; set; }
    public Enrollment Enrollment { get; set; } = null!;
    public ExamType ExamType { get; set; }
    public decimal? Listening { get; set; }
    public decimal? Reading { get; set; }
    public decimal? Writing { get; set; }
    public decimal? Speaking { get; set; }
    public decimal? Overall { get; set; }
    public string? Feedback { get; set; }

    public bool HasAnyScore => Listening.HasValue || Reading.HasValue || Writing.HasValue || Speaking.HasValue;
}
