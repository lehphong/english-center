using EnglishCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCenter.Infrastructure.Persistence.Configurations;

internal sealed class GradeConfiguration : IEntityTypeConfiguration<Grade>
{
    public void Configure(EntityTypeBuilder<Grade> builder)
    {
        builder.Ignore(g => g.HasAnyScore);
        builder.Property(g => g.Listening).HasPrecision(5, 1);
        builder.Property(g => g.Reading).HasPrecision(5, 1);
        builder.Property(g => g.Writing).HasPrecision(5, 1);
        builder.Property(g => g.Speaking).HasPrecision(5, 1);
        builder.Property(g => g.Overall).HasPrecision(5, 1);
        builder.Property(g => g.Feedback).HasMaxLength(500);
        builder.HasIndex(g => new { g.EnrollmentId, g.ExamType }).IsUnique();

        builder.HasOne(g => g.Enrollment)
            .WithMany(e => e.Grades)
            .HasForeignKey(g => g.EnrollmentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
