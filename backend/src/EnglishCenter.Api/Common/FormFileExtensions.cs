using EnglishCenter.Application.Common.Models;

namespace EnglishCenter.Api.Common;

internal static class FormFileExtensions
{
    public static FileUpload ToFileUpload(this IFormFile file) =>
        new(file.OpenReadStream(), file.FileName, file.Length, file.ContentType);
}
