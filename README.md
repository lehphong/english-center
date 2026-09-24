# English Center

Hệ thống quản lý trung tâm Anh ngữ: khóa học, lớp học, học viên, ghi danh và học phí, điểm danh, nhập điểm (IELTS / TOEIC / thang 10), tài khoản và phân quyền, cổng tra cứu cho học viên. Giao diện song ngữ Việt / Anh.

| Phần | Công nghệ |
|---|---|
| Backend | .NET 10, ASP.NET Core Web API, EF Core 10 + SQL Server, FluentValidation, JWT |
| Frontend | Nuxt 4 (SPA), Vue 3, TypeScript, Element Plus, Pinia, @nuxtjs/i18n |
| Kiểm thử | xUnit (unit + integration trên SQLite in-memory), Vitest + @nuxt/test-utils |
| Design system | Hoàng Thổ — token trong `frontend/design-system/tokens.json`, Storybook 10 |
| Hạ tầng | Docker Compose (SQL Server, API, nginx), GitHub Actions |

## Chạy nhanh bằng Docker

```bash
docker compose up -d --build
```

Mở http://localhost:8088. Đổi cổng bằng biến `WEB_PORT`, ví dụ `WEB_PORT=9000 docker compose up -d`.

Tài khoản mẫu (mật khẩu `Passw0rd!`):

| Tên đăng nhập | Vai trò |
|---|---|
| `admin` | Quản trị viên: toàn quyền, quản lý tài khoản |
| `staff` | Giáo vụ: nghiệp vụ đào tạo |
| `hv001` | Học viên: cổng tra cứu cá nhân |

## Chạy khi phát triển

Yêu cầu: .NET SDK 10, Node 22+, pnpm 10, Docker.

```bash
# 1. Database
docker compose up -d db                      # SQL Server ở localhost:14330

# 2. Backend: http://localhost:5080, tài liệu API: http://localhost:5080/scalar
cd backend
dotnet run --project src/EnglishCenter.Api   # tự chạy migration và nạp dữ liệu mẫu

# 3. Frontend: http://localhost:3000 (proxy /api sang backend)
cd frontend
pnpm install
pnpm dev
```

## Design system Hoàng Thổ

Giao diện theo design system **Hoàng Thổ**: bảng màu mệnh Thổ (vàng đất `ochre` làm điểm nhấn, nâu đất `umber` làm khung, nền cát sáng) theo quy tắc 60 – 30 – 10, chữ Be Vietnam Pro và IBM Plex Mono, hai theme sáng / tối.

- **Nguồn duy nhất**: `frontend/design-system/tokens.json`. Sửa token ở đây rồi chạy `pnpm tokens` để sinh lại `app/assets/css/tokens.css`.
- **Element Plus** được ánh xạ sang token trong `app/assets/css/element-plus.css`.
- **Kiểm tra tự động**: `test/unit/design-tokens.test.ts` báo lỗi khi `tokens.css` lệch khỏi `tokens.json`, hoặc khi một cặp chữ / nền dưới chuẩn WCAG (4.5:1 cho chữ, 3:1 cho viền và focus) ở bất kỳ theme nào.
- **Storybook**: `pnpm storybook` → http://localhost:6006. Có trang Giới thiệu (lý do chọn màu theo ngũ hành, 10 nguyên tắc màu), Foundations (màu, chữ, khoảng cách đọc từ `tokens.json`), từng component và mẫu bảng dữ liệu. Addon Accessibility kiểm tra mọi story; thanh công cụ đổi theme và ngôn ngữ.

Quy tắc dùng màu khi thêm màn hình mới:
- Mỗi vùng chỉ một nút `type="primary"` (nền `ochre`, chữ nâu `on-ochre` — không bao giờ chữ trắng trên `ochre`).
- Trạng thái dữ liệu dùng `<StatusTag>`: tone cố định theo trạng thái, luôn có hình + chữ. Không tô màu số tiền.
- Thẻ chỉ số dùng `<StatCard>`, chỉ một thẻ `accent` mỗi màn hình.

## Cấu trúc thư mục

```
.
├── backend/
│   ├── src/
│   │   ├── EnglishCenter.Domain/          Entity, enum, quy tắc nghiệp vụ thuần (không phụ thuộc gì)
│   │   │   ├── Entities/                  Course, CourseClass, Student, Enrollment, Grade...
│   │   │   └── Services/ScoreCalculator   Cách tính điểm theo thang IELTS / TOEIC / 10
│   │   ├── EnglishCenter.Application/     Use case của từng tính năng
│   │   │   ├── Common/                    Interface cho tầng ngoài, exception, phân trang
│   │   │   └── Features/<TínhNăng>/       Dto, Validator, Service (vd Features/Enrollments)
│   │   ├── EnglishCenter.Infrastructure/  EF Core, migration, seed, BCrypt, JWT, lưu file
│   │   └── EnglishCenter.Api/             Controller, xác thực / phân quyền, xử lý lỗi, OpenAPI
│   └── tests/
│       ├── EnglishCenter.UnitTests/         Domain + service (SQLite in-memory)
│       └── EnglishCenter.IntegrationTests/  Gọi HTTP thật vào API (WebApplicationFactory)
├── frontend/
│   ├── app/
│   │   ├── api/            Client gọi API, gom theo tính năng (useApi().courses.list...)
│   │   ├── components/     Component dùng chung và form dialog
│   │   ├── composables/    usePagedList, useApiErrors, useFormRules, useFormat...
│   │   ├── layouts/        default (quản trị), portal (học viên), auth (đăng nhập)
│   │   ├── middleware/     auth.global.ts: kiểm tra đăng nhập và vai trò của trang
│   │   ├── pages/          Mỗi file là một route (file-based routing)
│   │   ├── stores/         Pinia (phiên đăng nhập)
│   │   ├── types/          Kiểu dữ liệu khớp với DTO của API
│   │   └── utils/          Hàm thuần: chuẩn hóa lỗi, tính điểm xem trước...
│   ├── i18n/locales/       vi.json, en.json
│   ├── design-system/      tokens.json — nguồn token của design system Hoàng Thổ
│   ├── stories/            Storybook: Giới thiệu, Foundations, Components, Patterns
│   ├── .storybook/         cấu hình Storybook (tái tạo auto-import của Nuxt)
│   ├── scripts/            build-tokens.mjs sinh tokens.css
│   └── test/               unit/ (hàm thuần, token), nuxt/ (cần môi trường Nuxt)
├── docker-compose.yml
└── .github/workflows/ci.yml
```

Chiều phụ thuộc của backend: `Api → Infrastructure → Application → Domain`. Tầng trong không biết tầng ngoài: Application chỉ làm việc qua interface (`IApplicationDbContext`, `IPasswordHasher`, `IFileStorage`...), Infrastructure cung cấp cài đặt.

## Quy ước

### Lỗi API
Mọi lỗi trả về theo chuẩn ProblemDetails, kèm `code` ổn định để frontend dịch:

```json
{ "status": 422, "title": "Class IELTS-2601 is full (15 students).", "code": "class.full" }
```

| HTTP | Khi nào | Nơi phát sinh |
|---|---|---|
| 400 `validation` | Dữ liệu sai; `errors` là tên field → `[{ code, message, params }]` | FluentValidation |
| 401 | Chưa đăng nhập, sai mật khẩu, token hết hạn | `UnauthorizedException` |
| 403 | Không đủ quyền | Policy `Admin` / `Staff` / `Student` |
| 404 `<resource>.notFound` | Không tìm thấy | `NotFoundException` |
| 409 | Trùng dữ liệu (mã lớp, email...) | `ConflictException` |
| 422 | Vi phạm quy tắc nghiệp vụ (lớp đủ sĩ số...) | `DomainException` |

Frontend dịch lỗi bằng `useApiErrors()`: `errors.<code>` cho lỗi nghiệp vụ, `validation.<code>` cho lỗi từng field. Không có bản dịch thì hiện thông báo tiếng Anh từ server.

### Đa ngôn ngữ
- Mọi chữ hiển thị đặt trong `i18n/locales/vi.json` và `en.json`, gọi bằng `t('...')`. Hai file phải có cùng bộ key.
- Enum hiển thị qua `useEnumOptions().label('learningStatus', value)`, key `enums.<nhóm>.<giá trị>`.
- Tiền, ngày định dạng theo ngôn ngữ đang chọn bằng `useFormat()`.

### Thêm một tính năng mới
1. **Domain**: thêm entity / quy tắc; quy tắc vi phạm thì ném `DomainException("<feature>.<rule>", ...)`.
2. **Infrastructure**: cấu hình EF trong `Persistence/Configurations`, thêm `DbSet` vào `ApplicationDbContext` và `IApplicationDbContext`, rồi tạo migration:
   ```bash
   cd backend
   dotnet ef migrations add <TenMigration> -p src/EnglishCenter.Infrastructure -s src/EnglishCenter.Api -o Persistence/Migrations
   ```
3. **Application**: tạo `Features/<TinhNang>/` gồm Dto, Validator, Service; đăng ký service trong `DependencyInjection.cs`.
4. **Api**: controller mỏng, chỉ gọi service, gắn `[Authorize(Policy = ...)]`.
5. **Frontend**: khai báo kiểu trong `types/api.ts`, endpoint trong `api/index.ts`, trang trong `pages/`, chữ trong cả hai file ngôn ngữ, bản dịch cho các mã lỗi mới trong `errors.*`.
6. **Test**: unit test cho quy tắc nghiệp vụ, integration test cho luồng API chính.

## Lệnh thường dùng

| Việc | Lệnh |
|---|---|
| Test backend | `cd backend && dotnet test` |
| Test frontend | `cd frontend && pnpm test` |
| Kiểm tra kiểu / lint frontend | `pnpm typecheck` / `pnpm lint` |
| Build frontend (file tĩnh) | `pnpm build` → `.output/public` |
| Storybook | `pnpm storybook` (dev) / `pnpm build-storybook` |
| Sinh lại CSS token | `pnpm tokens` |

## Cấu hình khi triển khai

Biến môi trường của API (dấu `__` thay cho cấp lồng trong `appsettings.json`):

| Biến | Ý nghĩa |
|---|---|
| `ConnectionStrings__Default` | Chuỗi kết nối SQL Server |
| `Jwt__SigningKey` | Khóa ký JWT, **bắt buộc đổi**, tối thiểu 32 ký tự |
| `Database__InitMode` | `None` / `Migrate` / `EnsureCreated` |
| `Database__Seed` | `true` để nạp dữ liệu mẫu khi database trống |
| `Cors__AllowedOrigins__0` | Domain frontend khi frontend và API khác domain |
| `FileStorage__RootPath` | Thư mục lưu ảnh tải lên |

Frontend gọi API qua `/api` cùng domain (nginx proxy). Nếu API ở domain khác, đặt `NUXT_PUBLIC_API_BASE` lúc build.
