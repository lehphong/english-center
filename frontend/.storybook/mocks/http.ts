// A fake transport for the real API client (app/api/index.ts): routes each request to sample data,
// so stories exercise the same client code and error handling as the app.
import { FetchError } from 'ofetch'
import { action } from 'storybook/actions'
import type { AttendanceSheet, Dashboard, GradeSheet, PagedResult } from '../../app/types/api'
import type { ExamType } from '../../app/types/enums'
import * as db from './data'

interface RequestOptions {
  method?: string
  query?: Record<string, unknown>
  body?: unknown
}

const logRequest = action('api')

/** Throw what the API returns as ProblemDetails, so useApiErrors() translates it like in the app. */
function problem(status: number, code: string, title: string): never {
  const error = new FetchError(title)
  Object.assign(error, { statusCode: status, data: { status, code, title } })
  throw error
}

function paged<T extends object>(items: T[], query: Record<string, unknown> = {}): PagedResult<T> {
  const search = String(query.search ?? '').toLowerCase()
  const filters = Object.entries(query).filter(([k, v]) => !['page', 'pageSize', 'search'].includes(k) && v !== undefined)
  const matched = items.filter((item) => {
    const record = item as Record<string, unknown>
    const matchesSearch = !search || Object.values(record).some((v) => typeof v === 'string' && v.toLowerCase().includes(search))
    return matchesSearch && filters.every(([k, v]) => !(k in record) || String(record[k]) === String(v))
  })
  const page = Number(query.page ?? 1)
  const pageSize = Number(query.pageSize ?? 10)
  return {
    items: matched.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    totalCount: matched.length,
    totalPages: Math.ceil(matched.length / pageSize),
  }
}

function dashboard(): Dashboard {
  const active = db.enrollments.filter((e) => e.learningStatus === 'Studying' || e.learningStatus === 'Deferred')
  return {
    activeCourses: db.courses.filter((c) => c.isActive).length,
    openClasses: db.classes.length,
    students: db.students.length,
    activeEnrollments: active.length,
    collectedTuition: active.reduce((sum, e) => sum + e.amountPaid, 0),
    outstandingTuition: active.reduce((sum, e) => sum + e.balance, 0),
    openClassOccupancy: db.classes.map((c) => ({ classId: c.id, classCode: c.code, className: c.name, enrolled: c.enrolledCount, maxCapacity: c.maxCapacity })),
  }
}

function attendanceSheet(classId: number, sessionNumber: number): AttendanceSheet {
  const cls = db.classes.find((c) => c.id === classId) ?? problem(404, 'class.notFound', `class '${classId}' was not found.`)
  const course = db.courses.find((c) => c.id === cls.courseId)!
  const records = db.attendanceRecords.filter((a) => a.classCode === cls.code && a.sessionNumber === sessionNumber)
  return {
    classId, classCode: cls.code, className: cls.name, totalSessions: course.totalSessions, sessionNumber,
    sessionDate: records[0]?.sessionDate ?? null,
    rows: db.enrollments
      .filter((e) => e.classId === classId && e.learningStatus === 'Studying')
      .map((e) => {
        const record = records.find((a) => a.enrollmentId === e.id)
        return { enrollmentId: e.id, studentCode: e.studentCode, studentName: e.studentName, isPresent: record?.isPresent ?? null, note: record?.note ?? null }
      }),
  }
}

function gradeSheet(classId: number, examType: ExamType): GradeSheet {
  const cls = db.classes.find((c) => c.id === classId) ?? problem(404, 'class.notFound', `class '${classId}' was not found.`)
  const course = db.courses.find((c) => c.id === cls.courseId)!
  return {
    classId, classCode: cls.code, className: cls.name, gradingScheme: course.gradingScheme, examType,
    rows: db.enrollments
      .filter((e) => e.classId === classId && e.learningStatus !== 'Withdrawn')
      .map((e) => {
        const g = db.grades.find((x) => x.enrollmentId === e.id && x.examType === examType)
        return {
          enrollmentId: e.id, studentCode: e.studentCode, studentName: e.studentName,
          listening: g?.listening ?? null, reading: g?.reading ?? null, writing: g?.writing ?? null, speaking: g?.speaking ?? null,
          overall: g?.overall ?? null, feedback: g?.feedback ?? null,
        }
      }),
  }
}

type Handler = (match: RegExpMatchArray, options: RequestOptions) => unknown
const routes: [method: string, pattern: RegExp, handler: Handler][] = [
  ['POST', /^\/auth\/login$/, (_, { body }) => {
    const { username, password } = body as { username: string; password: string }
    const user = Object.values(db.sessionUsers).find((u) => u.username === username)
    if (!user || password !== 'Passw0rd!') problem(401, 'auth.invalidCredentials', 'Invalid username or password.')
    return { accessToken: 'storybook-token', expiresAt: '2099-01-01T00:00:00Z', user }
  }],
  ['GET', /^\/auth\/me$/, () => db.sessionUsers.Admin],
  ['POST', /^\/auth\/change-password$/, () => null],
  ['GET', /^\/dashboard$/, () => dashboard()],

  ['GET', /^\/courses\/options$/, () => db.courses.map((c) => ({ id: c.id, label: c.name }))],
  ['GET', /^\/courses$/, (_, { query }) => paged(db.courses, query)],
  ['GET', /^\/courses\/(\d+)$/, ([, id]) => db.courses.find((c) => c.id === Number(id))],
  ['DELETE', /^\/courses\/(\d+)$/, ([, id]) => {
    if (db.courses.find((c) => c.id === Number(id))!.classCount > 0) {
      problem(422, 'course.hasClasses', 'The course cannot be deleted because it has classes.')
    }
    return null
  }],

  ['GET', /^\/classes\/options$/, () => db.classes.map((c) => ({ id: c.id, label: `${c.code} - ${c.name}` }))],
  ['GET', /^\/classes$/, (_, { query }) => paged(db.classes, query)],
  ['GET', /^\/classes\/(\d+)\/students$/, ([, id]) => db.classStudents(Number(id))],
  ['GET', /^\/classes\/(\d+)$/, ([, id]) => db.classes.find((c) => c.id === Number(id))],

  ['GET', /^\/students\/options$/, (_, { query }) =>
    db.students.filter((s) => !query?.withoutAccountOnly || !s.userId).map((s) => ({ id: s.id, label: `${s.code} - ${s.fullName}` }))],
  ['GET', /^\/students$/, (_, { query }) => paged(db.students, query)],
  ['GET', /^\/students\/(\d+)\/enrollments$/, ([, id]) =>
    db.enrollments.filter((e) => e.studentId === Number(id)).map((e) => ({
      enrollmentId: e.id, classId: e.classId, classCode: e.classCode, className: e.className, courseName: e.courseName,
      learningStatus: e.learningStatus, paymentStatus: e.paymentStatus,
    }))],
  ['GET', /^\/students\/(\d+)$/, ([, id]) => db.students.find((s) => s.id === Number(id))],

  ['GET', /^\/enrollments$/, (_, { query }) => paged(db.enrollments, query)],
  ['POST', /^\/enrollments$/, (_, { body }) => {
    const { classId } = body as { classId: number }
    const cls = db.classes.find((c) => c.id === classId)
    if (cls && cls.enrolledCount >= cls.maxCapacity) problem(422, 'class.full', `Class ${cls.code} is full.`)
    return db.enrollments[0]
  }],

  ['GET', /^\/attendance\/sheet$/, (_, { query }) => attendanceSheet(Number(query?.classId), Number(query?.sessionNumber))],
  ['PUT', /^\/attendance\/sheet$/, (_, { body }) => {
    const request = body as { classId: number; sessionNumber: number }
    return attendanceSheet(request.classId, request.sessionNumber)
  }],
  ['GET', /^\/attendance$/, (_, { query }) => paged(db.attendanceRecords, query)],

  ['GET', /^\/grades\/sheet$/, (_, { query }) => gradeSheet(Number(query?.classId), query?.examType as ExamType)],
  ['PUT', /^\/grades\/sheet$/, (_, { body }) => {
    const request = body as { classId: number; examType: ExamType }
    return gradeSheet(request.classId, request.examType)
  }],
  ['GET', /^\/grades$/, (_, { query }) => paged(db.grades, query)],

  ['GET', /^\/users$/, (_, { query }) => paged(db.users, query)],

  ['GET', /^\/portal\/profile$/, () => db.students[0]],
  ['GET', /^\/portal\/classes$/, () => db.myClasses],
  ['GET', /^\/portal\/attendance$/, (_, { query }) =>
    db.myAttendance.filter((a) => !query?.enrollmentId || a.enrollmentId === Number(query.enrollmentId))],
  ['GET', /^\/portal\/grades$/, () => db.myGrades],
]

/** Drop-in replacement for the `$fetch` instance the API client is created with. */
export async function mockHttp(url: string, options: RequestOptions = {}) {
  const method = (options.method ?? 'GET').toUpperCase()
  logRequest(`${method} ${url}`, options.query ?? options.body ?? '')
  await new Promise((resolve) => setTimeout(resolve, 120))

  for (const [routeMethod, pattern, handler] of routes) {
    const match = url.match(pattern)
    if (match && routeMethod === method) return structuredClone(handler(match, options))
  }

  // Any other create / update / delete succeeds and echoes its body
  if (method !== 'GET') return options.body ?? null
  return problem(404, 'http.404', `No mock for ${method} ${url}`)
}
