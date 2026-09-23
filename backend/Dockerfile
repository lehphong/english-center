# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore trước để cache layer khi chỉ đổi code
COPY global.json Directory.Build.props Directory.Packages.props ./
COPY src/EnglishCenter.Domain/EnglishCenter.Domain.csproj src/EnglishCenter.Domain/
COPY src/EnglishCenter.Application/EnglishCenter.Application.csproj src/EnglishCenter.Application/
COPY src/EnglishCenter.Infrastructure/EnglishCenter.Infrastructure.csproj src/EnglishCenter.Infrastructure/
COPY src/EnglishCenter.Api/EnglishCenter.Api.csproj src/EnglishCenter.Api/
RUN dotnet restore src/EnglishCenter.Api/EnglishCenter.Api.csproj

COPY src/ src/
RUN dotnet publish src/EnglishCenter.Api/EnglishCenter.Api.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
RUN mkdir -p /app/uploads && chown $APP_UID /app/uploads
USER $APP_UID
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "EnglishCenter.Api.dll"]
