# English Center

A management system for an English language center: courses, classes, students, enrollments and tuition, attendance, grading (IELTS / TOEIC / 10-point scale), user accounts and roles, and a self-service portal for students. The interface is bilingual (Vietnamese / English).

| Area | Stack |
|---|---|
| Backend | .NET 10, ASP.NET Core Web API, EF Core 10 + SQL Server, FluentValidation, JWT |
| Frontend | Nuxt 4 (SPA), Vue 3, TypeScript, Element Plus, Pinia, @nuxtjs/i18n |
| Testing | xUnit (unit + integration on in-memory SQLite), Vitest + @nuxt/test-utils |
| Design system | Hoàng Thổ — tokens in `frontend/design-system/tokens.json`, Storybook 10 |
| Infrastructure | Docker Compose (SQL Server, API, nginx), GitHub Actions |

## Quick start with Docker

```bash
docker compose up -d --build
```

Open http://localhost:8088. Change the port with `WEB_PORT`, e.g. `WEB_PORT=9000 docker compose up -d`.

Sample accounts (password `Passw0rd!`):

| Username | Role |
|---|---|
| `admin` | Administrator: full access, manages accounts |
| `staff` | Academic staff: day-to-day training operations |
| `hv001` | Student: personal portal |

## Local development

Requirements: .NET SDK 10, Node 22+, pnpm 10, Docker.

```bash
# 1. Database
docker compose up -d db                      # SQL Server on localhost:14330

# 2. Backend: http://localhost:5080, API reference: http://localhost:5080/scalar
cd backend
dotnet run --project src/EnglishCenter.Api   # applies migrations and seeds sample data

# 3. Frontend: http://localhost:3000 (proxies /api to the backend)
cd frontend
pnpm install
pnpm dev
```

## Hoàng Thổ design system

The UI follows the **Hoàng Thổ** ("golden earth") design system: an earth palette built around the Thổ element — golden ochre (`ochre`) as the accent, earth brown (`umber`) for the navigation frame, and a light sand ground — applied with the 60–30–10 rule, Be Vietnam Pro and IBM Plex Mono typefaces, and light and dark themes.

- **Single source of truth**: `frontend/design-system/tokens.json`. Edit tokens there, then run `pnpm tokens` to regenerate `app/assets/css/tokens.css`.
- **Element Plus** is mapped onto the tokens in `app/assets/css/element-plus.css`.
- **Automated checks**: `test/unit/design-tokens.test.ts` fails when `tokens.css` drifts from `tokens.json`, or when any text/background pair falls below WCAG contrast (4.5:1 for text, 3:1 for borders and focus rings) in either theme.
- **Storybook**: `pnpm storybook` → http://localhost:6006. It documents the whole frontend against a mocked API: foundations (colors, type, spacing read from `tokens.json`); a component library of about 40 components grouped into Actions, Form, Data display, Feedback and Navigation, each with its states and when to use it; the app's dialogs; the three layouts; and every page. The Accessibility addon checks each story; the toolbar switches theme and language.

Color rules for new screens:
- One `type="primary"` button per region (ochre fill with dark `on-ochre` text — never white text on `ochre`).
- Data states use `<StatusTag>`: each state has a fixed tone and always shows a shape and a label. Amounts of money are never colored.
- Metrics use `<StatCard>`, with at most one `accent` card per screen.

## Project structure

```
.
├── backend/
│   ├── src/
│   │   ├── EnglishCenter.Domain/          Entities, enums, pure business rules (no dependencies)
│   │   │   ├── Entities/                  Course, CourseClass, Student, Enrollment, Grade...
│   │   │   └── Services/ScoreCalculator   Scoring for the IELTS / TOEIC / 10-point scales
│   │   ├── EnglishCenter.Application/     Use cases, one folder per feature
│   │   │   ├── Common/                    Interfaces for outer layers, exceptions, paging
│   │   │   └── Features/<Feature>/        DTOs, validators, service (e.g. Features/Enrollments)
│   │   ├── EnglishCenter.Infrastructure/  EF Core, migrations, seed data, BCrypt, JWT, file storage
│   │   └── EnglishCenter.Api/             Controllers, authentication / authorization, errors, OpenAPI
│   └── tests/
│       ├── EnglishCenter.UnitTests/         Domain + services (in-memory SQLite)
│       └── EnglishCenter.IntegrationTests/  Real HTTP calls against the API (WebApplicationFactory)
├── frontend/
│   ├── app/
│   │   ├── api/            API client grouped by feature (useApi().courses.list...)
│   │   ├── components/     Shared components and form dialogs
│   │   ├── composables/    usePagedList, useApiErrors, useFormRules, useFormat...
│   │   ├── layouts/        default (admin), portal (student), auth (sign-in)
│   │   ├── middleware/     auth.global.ts: authentication and per-page role checks
│   │   ├── pages/          One file per route (file-based routing)
│   │   ├── stores/         Pinia (session)
│   │   ├── types/          Types matching the API DTOs
│   │   └── utils/          Pure helpers: error normalization, grade preview...
│   ├── i18n/locales/       vi.json, en.json
│   ├── design-system/      tokens.json — Hoàng Thổ design tokens
│   ├── stories/            Storybook: introduction, foundations, components, layouts, pages
│   ├── .storybook/         Storybook config, Nuxt runtime shims and the mocked API
│   ├── scripts/            build-tokens.mjs generates tokens.css
│   └── test/               unit/ (pure functions, tokens), nuxt/ (needs the Nuxt environment)
├── docker-compose.yml
└── .github/workflows/ci.yml
```

Backend dependencies point inward: `Api → Infrastructure → Application → Domain`. Inner layers know nothing about outer ones: Application works only through interfaces (`IApplicationDbContext`, `IPasswordHasher`, `IFileStorage`...) that Infrastructure implements.

## Conventions

### API errors
Every error is returned as ProblemDetails with a stable `code` that the frontend translates:

```json
{ "status": 422, "title": "Class IELTS-2601 is full (15 students).", "code": "class.full" }
```

| HTTP | When | Raised by |
|---|---|---|
| 400 `validation` | Invalid input; `errors` maps each field to `[{ code, message, params }]` | FluentValidation |
| 401 | Not signed in, wrong password, expired token | `UnauthorizedException` |
| 403 | Insufficient role | `Admin` / `Staff` / `Student` policies |
| 404 `<resource>.notFound` | Resource does not exist | `NotFoundException` |
| 409 | Duplicate data (class code, email...) | `ConflictException` |
| 422 | Business rule violated (class is full...) | `DomainException` |

The frontend translates errors with `useApiErrors()`: `errors.<code>` for business errors and `validation.<code>` for field errors. When no translation exists, the English message from the server is shown.

### Internationalization
- Every visible string lives in `i18n/locales/vi.json` and `en.json` and is read with `t('...')`. Both files must have the same keys.
- Enums are displayed with `useEnumOptions().label('learningStatus', value)`, using keys `enums.<group>.<value>`.
- Money and dates are formatted for the current language with `useFormat()`.

### Adding a feature
1. **Domain**: add the entity or rule; a violated rule throws `DomainException("<feature>.<rule>", ...)`.
2. **Infrastructure**: configure EF in `Persistence/Configurations`, add the `DbSet` to `ApplicationDbContext` and `IApplicationDbContext`, then create a migration:
   ```bash
   cd backend
   dotnet ef migrations add <MigrationName> -p src/EnglishCenter.Infrastructure -s src/EnglishCenter.Api -o Persistence/Migrations
   ```
3. **Application**: create `Features/<Feature>/` with DTOs, validators and a service; register the service in `DependencyInjection.cs`.
4. **Api**: keep controllers thin — call the service and add `[Authorize(Policy = ...)]`.
5. **Frontend**: declare types in `types/api.ts`, endpoints in `api/index.ts`, pages in `pages/`, strings in both locale files, and translations for any new error codes under `errors.*`. Add the endpoint to the Storybook mock API and a story for the new page.
6. **Tests**: unit tests for business rules, integration tests for the main API flows.

## Common commands

| Task | Command |
|---|---|
| Backend tests | `cd backend && dotnet test` |
| Frontend tests | `cd frontend && pnpm test` |
| Frontend type check / lint | `pnpm typecheck` / `pnpm lint` |
| Frontend build (static files) | `pnpm build` → `.output/public` |
| Storybook | `pnpm storybook` (dev) / `pnpm build-storybook` |
| Regenerate token CSS | `pnpm tokens` |

## Deployment configuration

API environment variables (`__` stands for nesting in `appsettings.json`):

| Variable | Purpose |
|---|---|
| `ConnectionStrings__Default` | SQL Server connection string |
| `Jwt__SigningKey` | JWT signing key — **must be changed**, at least 32 characters |
| `Database__InitMode` | `None` / `Migrate` / `EnsureCreated` |
| `Database__Seed` | `true` to seed sample data into an empty database |
| `Cors__AllowedOrigins__0` | Frontend origin when the frontend and API are on different domains |
| `FileStorage__RootPath` | Folder for uploaded images |

The frontend calls the API through `/api` on the same domain (nginx proxy). If the API lives on another domain, set `NUXT_PUBLIC_API_BASE` at build time.
