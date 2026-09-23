namespace EnglishCenter.Domain.Enums;

/// <summary>Thang điểm của khóa học, quyết định khoảng điểm hợp lệ và cách tính điểm tổng.</summary>
public enum GradingScheme
{
    /// <summary>Thang 10, điểm tổng là trung bình các kỹ năng đã nhập.</summary>
    Standard,

    /// <summary>Band 0-9 (bước 0.5), điểm tổng là trung bình 4 kỹ năng làm tròn theo quy tắc IELTS.</summary>
    Ielts,

    /// <summary>Nghe / Đọc 5-495, Nói / Viết 0-200; điểm tổng = Nghe + Đọc.</summary>
    Toeic
}
