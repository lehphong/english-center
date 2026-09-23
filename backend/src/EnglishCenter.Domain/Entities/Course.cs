using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Domain.Entities;

public class Course : AuditableEntity
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public decimal TuitionFee { get; set; }
    public int TotalSessions { get; set; }
    public GradingScheme GradingScheme { get; set; }
    public string? ThumbnailUrl { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<CourseClass> Classes { get; } = new List<CourseClass>();
}
