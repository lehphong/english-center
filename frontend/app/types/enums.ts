// Khớp với enum của backend (được serialize dạng chuỗi)
export const USER_ROLES = ['Admin', 'Staff', 'Student'] as const
export const GRADING_SCHEMES = ['Standard', 'Ielts', 'Toeic'] as const
export const LEARNING_STATUSES = ['Studying', 'Deferred', 'Completed', 'Withdrawn'] as const
export const PAYMENT_STATUSES = ['Unpaid', 'Partial', 'Paid'] as const
export const EXAM_TYPES = ['Placement', 'Progress1', 'Progress2', 'Midterm', 'Final'] as const
export const GENDERS = ['Male', 'Female', 'Other'] as const
export const ENGLISH_LEVELS = [
  'Beginner',
  'Elementary',
  'PreIntermediate',
  'Intermediate',
  'UpperIntermediate',
  'Advanced',
] as const
export const SKILLS = ['listening', 'reading', 'writing', 'speaking'] as const

export type UserRole = (typeof USER_ROLES)[number]
export type GradingScheme = (typeof GRADING_SCHEMES)[number]
export type LearningStatus = (typeof LEARNING_STATUSES)[number]
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]
export type ExamType = (typeof EXAM_TYPES)[number]
export type Gender = (typeof GENDERS)[number]
export type EnglishLevel = (typeof ENGLISH_LEVELS)[number]
export type Skill = (typeof SKILLS)[number]

/** Tên nhóm enum dùng làm key dịch: enums.<group>.<value> */
export const ENUM_GROUPS = {
  role: USER_ROLES,
  gradingScheme: GRADING_SCHEMES,
  learningStatus: LEARNING_STATUSES,
  paymentStatus: PAYMENT_STATUSES,
  examType: EXAM_TYPES,
  gender: GENDERS,
  englishLevel: ENGLISH_LEVELS,
} as const

export type EnumGroup = keyof typeof ENUM_GROUPS
