import type {
  EnglishLevel,
  ExamType,
  Gender,
  GradingScheme,
  LearningStatus,
  PaymentStatus,
  UserRole,
} from './enums'

// Chung
export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface PageQuery {
  page?: number
  pageSize?: number
  search?: string
}

export interface Option {
  id: number
  label: string
}

// Auth
export interface CurrentUser {
  id: number
  username: string
  role: UserRole
  studentId: number | null
  fullName: string | null
}

export interface AuthResponse {
  accessToken: string
  expiresAt: string
  user: CurrentUser
}

// Khóa học
export interface Course {
  id: number
  name: string
  description: string | null
  tuitionFee: number
  totalSessions: number
  gradingScheme: GradingScheme
  thumbnailUrl: string | null
  isActive: boolean
  classCount: number
}

export interface SaveCourse {
  name: string
  description: string | null
  tuitionFee: number
  totalSessions: number
  gradingScheme: GradingScheme
  isActive: boolean
}

export interface CourseQuery extends PageQuery {
  isActive?: boolean
  gradingScheme?: GradingScheme
}

// Lớp học
export interface CourseClass {
  id: number
  code: string
  name: string
  courseId: number
  courseName: string
  teacherName: string | null
  schedule: string | null
  room: string | null
  startDate: string
  endDate: string | null
  maxCapacity: number
  enrolledCount: number
}

export interface ClassStudent {
  enrollmentId: number
  studentId: number
  studentCode: string
  studentName: string
  learningStatus: LearningStatus
  paymentStatus: PaymentStatus
}

export interface SaveClass {
  code: string
  name: string
  courseId: number | null
  teacherName: string | null
  schedule: string | null
  room: string | null
  startDate: string | null
  endDate: string | null
  maxCapacity: number
}

export interface ClassQuery extends PageQuery {
  courseId?: number
}

// Học viên
export interface Student {
  id: number
  code: string
  fullName: string
  dateOfBirth: string | null
  gender: Gender
  email: string
  phoneNumber: string
  address: string | null
  avatarUrl: string | null
  entryLevel: EnglishLevel
  userId: number | null
  username: string | null
  enrollmentCount: number
}

export interface StudentEnrollment {
  enrollmentId: number
  classId: number
  classCode: string
  className: string
  courseName: string
  learningStatus: LearningStatus
  paymentStatus: PaymentStatus
}

export interface SaveStudent {
  code: string
  fullName: string
  dateOfBirth: string | null
  gender: Gender
  email: string
  phoneNumber: string
  address: string | null
  entryLevel: EnglishLevel
}

export interface CreateStudent extends SaveStudent {
  createAccount: boolean
  username: string | null
  password: string | null
}

export interface StudentQuery extends PageQuery {
  entryLevel?: EnglishLevel
  hasAccount?: boolean
}

// Ghi danh
export interface Enrollment {
  id: number
  studentId: number
  studentCode: string
  studentName: string
  classId: number
  classCode: string
  className: string
  courseName: string
  enrolledOn: string
  tuitionFee: number
  amountPaid: number
  balance: number
  paymentStatus: PaymentStatus
  learningStatus: LearningStatus
}

export interface CreateEnrollment {
  studentId: number | null
  classId: number | null
  enrolledOn: string | null
  tuitionFee: number | null
  amountPaid: number
}

export interface UpdateEnrollment {
  tuitionFee: number
  amountPaid: number
  learningStatus: LearningStatus
}

export interface EnrollmentQuery extends PageQuery {
  classId?: number
  studentId?: number
  paymentStatus?: PaymentStatus
  learningStatus?: LearningStatus
}

// Điểm danh
export interface AttendanceRow {
  enrollmentId: number
  studentCode: string
  studentName: string
  isPresent: boolean | null
  note: string | null
}

export interface AttendanceSheet {
  classId: number
  classCode: string
  className: string
  totalSessions: number
  sessionNumber: number
  sessionDate: string | null
  rows: AttendanceRow[]
}

export interface SaveAttendance {
  classId: number
  sessionNumber: number
  sessionDate: string
  entries: { enrollmentId: number; isPresent: boolean; note: string | null }[]
}

export interface AttendanceRecord {
  id: number
  enrollmentId: number
  studentCode: string
  studentName: string
  classCode: string
  sessionNumber: number
  sessionDate: string
  isPresent: boolean
  note: string | null
}

export interface AttendanceQuery extends PageQuery {
  classId?: number
  sessionNumber?: number
  isPresent?: boolean
}

// Điểm
export interface Scores {
  listening: number | null
  reading: number | null
  writing: number | null
  speaking: number | null
}

export interface GradeRow extends Scores {
  enrollmentId: number
  studentCode: string
  studentName: string
  overall: number | null
  feedback: string | null
}

export interface GradeSheet {
  classId: number
  classCode: string
  className: string
  gradingScheme: GradingScheme
  examType: ExamType
  rows: GradeRow[]
}

export interface SaveGradeSheet {
  classId: number
  examType: ExamType
  entries: (Scores & { enrollmentId: number; feedback: string | null })[]
}

export interface Grade extends Scores {
  id: number
  enrollmentId: number
  studentCode: string
  studentName: string
  classCode: string
  courseName: string
  gradingScheme: GradingScheme
  examType: ExamType
  overall: number | null
  feedback: string | null
}

export interface GradeQuery extends PageQuery {
  classId?: number
  examType?: ExamType
}

// Tài khoản
export interface User {
  id: number
  username: string
  role: UserRole
  isActive: boolean
  studentId: number | null
  studentName: string | null
  lastLoginAt: string | null
}

export interface CreateUser {
  username: string
  password: string
  role: UserRole
  studentId: number | null
}

export interface UpdateUser {
  role: UserRole
  isActive: boolean
  studentId: number | null
}

export interface UserQuery extends PageQuery {
  role?: UserRole
  isActive?: boolean
}

// Cổng học viên
export interface MyClass {
  enrollmentId: number
  classCode: string
  className: string
  courseName: string
  teacherName: string | null
  schedule: string | null
  room: string | null
  startDate: string
  endDate: string | null
  totalSessions: number
  learningStatus: LearningStatus
  paymentStatus: PaymentStatus
  balance: number
  sessionsAttended: number
  sessionsRecorded: number
}

export interface MyAttendance {
  enrollmentId: number
  classCode: string
  sessionNumber: number
  sessionDate: string
  isPresent: boolean
  note: string | null
}

export interface MyGrade extends Scores {
  enrollmentId: number
  classCode: string
  courseName: string
  gradingScheme: GradingScheme
  examType: ExamType
  overall: number | null
  feedback: string | null
}

// Tổng quan
export interface Dashboard {
  activeCourses: number
  openClasses: number
  students: number
  activeEnrollments: number
  collectedTuition: number
  outstandingTuition: number
  openClassOccupancy: { classId: number; classCode: string; className: string; enrolled: number; maxCapacity: number }[]
}
