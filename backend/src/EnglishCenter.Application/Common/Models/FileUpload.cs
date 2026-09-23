namespace EnglishCenter.Application.Common.Models;

public sealed record FileUpload(Stream Content, string FileName, long Length, string ContentType);
