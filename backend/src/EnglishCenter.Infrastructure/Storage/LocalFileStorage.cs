using EnglishCenter.Application.Common.Abstractions;
using Microsoft.Extensions.Options;

namespace EnglishCenter.Infrastructure.Storage;

public sealed class FileStorageOptions
{
    public const string SectionName = "FileStorage";

    /// <summary>Thư mục vật lý chứa file tải lên.</summary>
    public string RootPath { get; set; } = "wwwroot/uploads";

    /// <summary>Đường dẫn URL tương ứng với RootPath.</summary>
    public string PublicBasePath { get; set; } = "/uploads";
}

/// <summary>Lưu file trên ổ đĩa của server. Có thể thay bằng S3 / Azure Blob mà không đổi tầng Application.</summary>
internal sealed class LocalFileStorage(IOptions<FileStorageOptions> options) : IFileStorage
{
    private readonly FileStorageOptions _options = options.Value;

    public async Task<string> SaveAsync(Stream content, string fileName, string folder, CancellationToken cancellationToken = default)
    {
        var directory = Path.Combine(_options.RootPath, folder);
        Directory.CreateDirectory(directory);

        // Tên file ngẫu nhiên, chỉ giữ phần mở rộng, để tránh trùng và tránh ký tự nguy hiểm trong tên gốc
        var storedName = $"{Guid.NewGuid():N}{Path.GetExtension(fileName).ToLowerInvariant()}";
        await using (var target = File.Create(Path.Combine(directory, storedName)))
        {
            await content.CopyToAsync(target, cancellationToken);
        }

        return $"{_options.PublicBasePath.TrimEnd('/')}/{folder}/{storedName}";
    }

    public Task DeleteAsync(string? url, CancellationToken cancellationToken = default)
    {
        var basePath = _options.PublicBasePath.TrimEnd('/') + "/";
        if (string.IsNullOrEmpty(url) || !url.StartsWith(basePath, StringComparison.Ordinal))
        {
            return Task.CompletedTask;
        }

        var relative = url[basePath.Length..].Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.GetFullPath(Path.Combine(_options.RootPath, relative));
        if (fullPath.StartsWith(Path.GetFullPath(_options.RootPath), StringComparison.Ordinal) && File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
        return Task.CompletedTask;
    }
}
