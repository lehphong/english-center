namespace EnglishCenter.Application.Common.Models;

/// <summary>Tham số phân trang và tìm kiếm dùng chung, nhận từ query string.</summary>
public record PageQuery
{
    public const int MaxPageSize = 100;

    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }

    internal int NormalizedPage => Math.Max(Page, 1);
    internal int NormalizedPageSize => Math.Clamp(PageSize, 1, MaxPageSize);
    internal string? Term => string.IsNullOrWhiteSpace(Search) ? null : Search.Trim();
}
