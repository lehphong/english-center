using EnglishCenter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCenter.Infrastructure.Persistence.Configurations;

internal sealed class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        builder.Property(s => s.Code).HasMaxLength(20);
        builder.Property(s => s.FullName).HasMaxLength(100);
        builder.Property(s => s.Email).HasMaxLength(150);
        builder.Property(s => s.PhoneNumber).HasMaxLength(15);
        builder.Property(s => s.Address).HasMaxLength(250);
        builder.Property(s => s.AvatarUrl).HasMaxLength(300);
        builder.HasIndex(s => s.Code).IsUnique();
        builder.HasIndex(s => s.Email).IsUnique();
        builder.HasIndex(s => s.PhoneNumber).IsUnique();

        builder.HasOne(s => s.User)
            .WithOne(u => u.Student)
            .HasForeignKey<Student>(s => s.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
