using EnglishCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCenter.Infrastructure.Persistence.Configurations;

internal sealed class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.Property(c => c.Name).HasMaxLength(150);
        builder.Property(c => c.Description).HasMaxLength(4000);
        builder.Property(c => c.ThumbnailUrl).HasMaxLength(300);
        builder.HasIndex(c => c.Name);
    }
}
