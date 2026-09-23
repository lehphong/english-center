using EnglishCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCenter.Infrastructure.Persistence.Configurations;

internal sealed class CourseClassConfiguration : IEntityTypeConfiguration<CourseClass>
{
    public void Configure(EntityTypeBuilder<CourseClass> builder)
    {
        builder.ToTable("Classes");
        builder.Property(c => c.Code).HasMaxLength(20);
        builder.Property(c => c.Name).HasMaxLength(150);
        builder.Property(c => c.TeacherName).HasMaxLength(100);
        builder.Property(c => c.Schedule).HasMaxLength(100);
        builder.Property(c => c.Room).HasMaxLength(50);
        builder.HasIndex(c => c.Code).IsUnique();

        builder.HasOne(c => c.Course)
            .WithMany(c => c.Classes)
            .HasForeignKey(c => c.CourseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
