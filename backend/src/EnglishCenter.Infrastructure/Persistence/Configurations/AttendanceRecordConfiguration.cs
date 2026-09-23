using EnglishCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCenter.Infrastructure.Persistence.Configurations;

internal sealed class AttendanceRecordConfiguration : IEntityTypeConfiguration<AttendanceRecord>
{
    public void Configure(EntityTypeBuilder<AttendanceRecord> builder)
    {
        builder.Property(a => a.Note).HasMaxLength(250);
        builder.HasIndex(a => new { a.EnrollmentId, a.SessionNumber }).IsUnique();

        builder.HasOne(a => a.Enrollment)
            .WithMany(e => e.AttendanceRecords)
            .HasForeignKey(a => a.EnrollmentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
