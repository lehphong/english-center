namespace EnglishCenter.Application.Common.Abstractions;

public interface IFileStorage
{
    /// <summary>Lưu file vào <paramref name="folder"/>, trả về URL công khai.</summary>
    Task<string> SaveAsync(Stream content, string fileName, string folder, CancellationToken cancellationToken = default);

    Task DeleteAsync(string? url, CancellationToken cancellationToken = default);
}
