using EnglishCenter.Api.Extensions;
using EnglishCenter.Application;
using EnglishCenter.Infrastructure;
using EnglishCenter.Infrastructure.Persistence;
using EnglishCenter.Infrastructure.Storage;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration)
    .AddApi(builder.Configuration);

// Đường dẫn lưu file tương đối được tính theo thư mục gốc của ứng dụng
builder.Services.PostConfigure<FileStorageOptions>(o =>
    o.RootPath = Path.GetFullPath(o.RootPath, builder.Environment.ContentRootPath));

var app = builder.Build();

await app.Services.InitializeDatabaseAsync(app.Configuration);

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(o => o.WithTitle("English Center API"));
}

// File tải lên (ảnh khóa học, ảnh đại diện) được phục vụ tĩnh
var storage = app.Services.GetRequiredService<IOptions<FileStorageOptions>>().Value;
Directory.CreateDirectory(storage.RootPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(storage.RootPath),
    RequestPath = storage.PublicBasePath
});

app.UseCors(ServiceCollectionExtensions.CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health").AllowAnonymous();

await app.RunAsync();
