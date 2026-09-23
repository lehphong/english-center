namespace EnglishCenter.Domain.Common;

public abstract class Entity
{
    public int Id { get; set; }
}

/// <summary>Entity có thời điểm tạo / cập nhật, được gán tự động khi lưu (xem AuditableEntityInterceptor).</summary>
public abstract class AuditableEntity : Entity
{
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
