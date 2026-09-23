import type {
  AttendanceQuery,
  AttendanceRecord,
  AttendanceSheet,
  AuthResponse,
  ClassQuery,
  ClassStudent,
  Course,
  CourseClass,
  CourseQuery,
  CreateEnrollment,
  CreateStudent,
  CreateUser,
  CurrentUser,
  Dashboard,
  Enrollment,
  EnrollmentQuery,
  Grade,
  GradeQuery,
  GradeSheet,
  MyAttendance,
  MyClass,
  MyGrade,
  Option,
  PagedResult,
  SaveAttendance,
  SaveClass,
  SaveCourse,
  SaveGradeSheet,
  SaveStudent,
  Student,
  StudentEnrollment,
  StudentQuery,
  UpdateEnrollment,
  UpdateUser,
  User,
  UserQuery,
} from '~/types/api'
import type { ExamType } from '~/types/enums'

type Http = ReturnType<typeof $fetch.create>

/** Các nhóm endpoint của backend, dùng qua composable useApi(). */
export function createApi(http: Http) {
  const upload = <T>(url: string, file: File) => {
    const body = new FormData()
    body.append('file', file)
    return http<T>(url, { method: 'POST', body })
  }

  return {
    auth: {
      login: (username: string, password: string) =>
        http<AuthResponse>('/auth/login', { method: 'POST', body: { username, password } }),
      me: () => http<CurrentUser>('/auth/me'),
      changePassword: (currentPassword: string, newPassword: string) =>
        http('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),
    },
    dashboard: {
      get: () => http<Dashboard>('/dashboard'),
    },
    courses: {
      list: (query: CourseQuery) => http<PagedResult<Course>>('/courses', { query: cleanQuery(query) }),
      options: (activeOnly = false) => http<Option[]>('/courses/options', { query: { activeOnly } }),
      get: (id: number) => http<Course>(`/courses/${id}`),
      create: (body: SaveCourse) => http<Course>('/courses', { method: 'POST', body }),
      update: (id: number, body: SaveCourse) => http<Course>(`/courses/${id}`, { method: 'PUT', body }),
      uploadThumbnail: (id: number, file: File) => upload<Course>(`/courses/${id}/thumbnail`, file),
      remove: (id: number) => http(`/courses/${id}`, { method: 'DELETE' }),
    },
    classes: {
      list: (query: ClassQuery) => http<PagedResult<CourseClass>>('/classes', { query: cleanQuery(query) }),
      options: () => http<Option[]>('/classes/options'),
      get: (id: number) => http<CourseClass>(`/classes/${id}`),
      students: (id: number) => http<ClassStudent[]>(`/classes/${id}/students`),
      create: (body: SaveClass) => http<CourseClass>('/classes', { method: 'POST', body }),
      update: (id: number, body: SaveClass) => http<CourseClass>(`/classes/${id}`, { method: 'PUT', body }),
      remove: (id: number) => http(`/classes/${id}`, { method: 'DELETE' }),
    },
    students: {
      list: (query: StudentQuery) => http<PagedResult<Student>>('/students', { query: cleanQuery(query) }),
      options: (withoutAccountOnly = false) =>
        http<Option[]>('/students/options', { query: { withoutAccountOnly } }),
      get: (id: number) => http<Student>(`/students/${id}`),
      enrollments: (id: number) => http<StudentEnrollment[]>(`/students/${id}/enrollments`),
      create: (body: CreateStudent) => http<Student>('/students', { method: 'POST', body }),
      update: (id: number, body: SaveStudent) => http<Student>(`/students/${id}`, { method: 'PUT', body }),
      uploadAvatar: (id: number, file: File) => upload<Student>(`/students/${id}/avatar`, file),
      remove: (id: number) => http(`/students/${id}`, { method: 'DELETE' }),
    },
    enrollments: {
      list: (query: EnrollmentQuery) => http<PagedResult<Enrollment>>('/enrollments', { query: cleanQuery(query) }),
      create: (body: CreateEnrollment) => http<Enrollment>('/enrollments', { method: 'POST', body }),
      update: (id: number, body: UpdateEnrollment) => http<Enrollment>(`/enrollments/${id}`, { method: 'PUT', body }),
      remove: (id: number) => http(`/enrollments/${id}`, { method: 'DELETE' }),
    },
    attendance: {
      list: (query: AttendanceQuery) =>
        http<PagedResult<AttendanceRecord>>('/attendance', { query: cleanQuery(query) }),
      sheet: (classId: number, sessionNumber: number) =>
        http<AttendanceSheet>('/attendance/sheet', { query: { classId, sessionNumber } }),
      saveSheet: (body: SaveAttendance) => http<AttendanceSheet>('/attendance/sheet', { method: 'PUT', body }),
      remove: (id: number) => http(`/attendance/${id}`, { method: 'DELETE' }),
    },
    grades: {
      list: (query: GradeQuery) => http<PagedResult<Grade>>('/grades', { query: cleanQuery(query) }),
      sheet: (classId: number, examType: ExamType) =>
        http<GradeSheet>('/grades/sheet', { query: { classId, examType } }),
      saveSheet: (body: SaveGradeSheet) => http<GradeSheet>('/grades/sheet', { method: 'PUT', body }),
      remove: (id: number) => http(`/grades/${id}`, { method: 'DELETE' }),
    },
    users: {
      list: (query: UserQuery) => http<PagedResult<User>>('/users', { query: cleanQuery(query) }),
      create: (body: CreateUser) => http<User>('/users', { method: 'POST', body }),
      update: (id: number, body: UpdateUser) => http<User>(`/users/${id}`, { method: 'PUT', body }),
      resetPassword: (id: number, newPassword: string) =>
        http(`/users/${id}/reset-password`, { method: 'POST', body: { newPassword } }),
      remove: (id: number) => http(`/users/${id}`, { method: 'DELETE' }),
    },
    portal: {
      profile: () => http<Student>('/portal/profile'),
      classes: () => http<MyClass[]>('/portal/classes'),
      attendance: (enrollmentId?: number) =>
        http<MyAttendance[]>('/portal/attendance', { query: cleanQuery({ enrollmentId }) }),
      grades: (enrollmentId?: number) => http<MyGrade[]>('/portal/grades', { query: cleanQuery({ enrollmentId }) }),
    },
  }
}

export type Api = ReturnType<typeof createApi>
