// Sample data for Storybook, shaped exactly like the API DTOs in app/types/api.ts.
import type {
  AttendanceRecord,
  ClassStudent,
  Course,
  CourseClass,
  CurrentUser,
  Enrollment,
  Grade,
  MyAttendance,
  MyClass,
  MyGrade,
  Student,
  User,
} from '../../app/types/api'

export const courses: Course[] = [
  { id: 1, name: 'IELTS Intensive 6.5+', description: 'Luyện 4 kỹ năng IELTS, mục tiêu band 6.5 trở lên.', tuitionFee: 8_500_000, totalSessions: 36, gradingScheme: 'Ielts', thumbnailUrl: null, isActive: true, classCount: 2 },
  { id: 2, name: 'TOEIC 650+', description: 'Luyện đề TOEIC Listening & Reading.', tuitionFee: 5_000_000, totalSessions: 24, gradingScheme: 'Toeic', thumbnailUrl: null, isActive: true, classCount: 1 },
  { id: 3, name: 'Giao tiếp cơ bản', description: 'Phản xạ giao tiếp cho người mới bắt đầu.', tuitionFee: 3_500_000, totalSessions: 20, gradingScheme: 'Standard', thumbnailUrl: null, isActive: true, classCount: 1 },
  { id: 4, name: 'Tiếng Anh thiếu nhi', description: 'Khóa hè cho học sinh tiểu học.', tuitionFee: 2_800_000, totalSessions: 16, gradingScheme: 'Standard', thumbnailUrl: null, isActive: false, classCount: 0 },
]

export const classes: CourseClass[] = [
  { id: 1, code: 'IELTS-2601', name: 'IELTS tối 2-4-6', courseId: 1, courseName: 'IELTS Intensive 6.5+', teacherName: 'Nguyễn Mai Hương', schedule: 'T2-T4-T6 18:00-20:00', room: 'P201', startDate: '2026-09-07', endDate: '2026-12-18', maxCapacity: 15, enrolledCount: 3 },
  { id: 2, code: 'TOEIC-2601', name: 'TOEIC tối 3-5-7', courseId: 2, courseName: 'TOEIC 650+', teacherName: 'John Smith', schedule: 'T3-T5-T7 18:00-20:00', room: 'P105', startDate: '2026-09-08', endDate: null, maxCapacity: 20, enrolledCount: 2 },
  { id: 3, code: 'GT-2601', name: 'Giao tiếp cuối tuần', courseId: 3, courseName: 'Giao tiếp cơ bản', teacherName: 'Trần Minh Đức', schedule: 'T7-CN 09:00-11:00', room: 'P301', startDate: '2026-09-12', endDate: null, maxCapacity: 2, enrolledCount: 2 },
  { id: 4, code: 'IELTS-2602', name: 'IELTS sáng cuối tuần', courseId: 1, courseName: 'IELTS Intensive 6.5+', teacherName: 'Nguyễn Mai Hương', schedule: 'T7-CN 08:00-10:00', room: 'P202', startDate: '2026-10-03', endDate: null, maxCapacity: 12, enrolledCount: 0 },
]

export const students: Student[] = [
  { id: 1, code: 'HV001', fullName: 'Nguyễn Văn An', dateOfBirth: '2003-05-15', gender: 'Male', email: 'an.nguyen@example.com', phoneNumber: '0912345678', address: 'Cầu Giấy, Hà Nội', avatarUrl: null, entryLevel: 'Intermediate', userId: 3, username: 'hv001', enrollmentCount: 2 },
  { id: 2, code: 'HV002', fullName: 'Trần Thị Bình', dateOfBirth: '2004-08-22', gender: 'Female', email: 'binh.tran@example.com', phoneNumber: '0987654321', address: 'Đống Đa, Hà Nội', avatarUrl: null, entryLevel: 'Elementary', userId: null, username: null, enrollmentCount: 1 },
  { id: 3, code: 'HV003', fullName: 'Lê Hoàng Cường', dateOfBirth: '2002-01-30', gender: 'Male', email: 'cuong.le@example.com', phoneNumber: '0901234567', address: null, avatarUrl: null, entryLevel: 'Beginner', userId: null, username: null, enrollmentCount: 1 },
  { id: 4, code: 'HV004', fullName: 'Phạm Thu Dung', dateOfBirth: '2005-11-02', gender: 'Female', email: 'dung.pham@example.com', phoneNumber: '0934567890', address: 'Hà Đông, Hà Nội', avatarUrl: null, entryLevel: 'UpperIntermediate', userId: null, username: null, enrollmentCount: 1 },
  { id: 5, code: 'HV005', fullName: 'Vũ Minh Đức', dateOfBirth: null, gender: 'Male', email: 'duc.vu@example.com', phoneNumber: '0967890123', address: null, avatarUrl: null, entryLevel: 'PreIntermediate', userId: null, username: null, enrollmentCount: 2 },
  { id: 6, code: 'HV006', fullName: 'Hoàng Lan Chi', dateOfBirth: '2006-03-19', gender: 'Female', email: 'chi.hoang@example.com', phoneNumber: '0978901234', address: 'Long Biên, Hà Nội', avatarUrl: null, entryLevel: 'Advanced', userId: null, username: null, enrollmentCount: 0 },
]

const enrollment = (
  id: number, studentId: number, classId: number, enrolledOn: string, tuitionFee: number, amountPaid: number,
  learningStatus: Enrollment['learningStatus'],
): Enrollment => {
  const s = students.find((x) => x.id === studentId)!
  const c = classes.find((x) => x.id === classId)!
  return {
    id, studentId, studentCode: s.code, studentName: s.fullName, classId, classCode: c.code, className: c.name,
    courseName: c.courseName, enrolledOn, tuitionFee, amountPaid, balance: Math.max(tuitionFee - amountPaid, 0),
    paymentStatus: amountPaid >= tuitionFee ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Unpaid', learningStatus,
  }
}

export const enrollments: Enrollment[] = [
  enrollment(1, 1, 1, '2026-09-01', 8_500_000, 8_500_000, 'Studying'),
  enrollment(2, 2, 2, '2026-09-02', 5_000_000, 2_000_000, 'Studying'),
  enrollment(3, 3, 3, '2026-09-03', 3_500_000, 0, 'Studying'),
  enrollment(4, 1, 3, '2026-09-03', 3_000_000, 3_000_000, 'Studying'),
  enrollment(5, 4, 1, '2026-09-04', 8_500_000, 4_000_000, 'Deferred'),
  enrollment(6, 5, 1, '2026-09-05', 8_500_000, 8_500_000, 'Studying'),
  enrollment(7, 5, 2, '2026-06-01', 5_000_000, 5_000_000, 'Completed'),
  enrollment(8, 2, 1, '2026-09-06', 8_500_000, 0, 'Withdrawn'),
]

export const classStudents = (classId: number): ClassStudent[] =>
  enrollments
    .filter((e) => e.classId === classId)
    .map((e) => ({ enrollmentId: e.id, studentId: e.studentId, studentCode: e.studentCode, studentName: e.studentName, learningStatus: e.learningStatus, paymentStatus: e.paymentStatus }))

export const attendanceRecords: AttendanceRecord[] = [
  { id: 1, enrollmentId: 1, studentCode: 'HV001', studentName: 'Nguyễn Văn An', classCode: 'IELTS-2601', sessionNumber: 1, sessionDate: '2026-09-07', isPresent: true, note: null },
  { id: 2, enrollmentId: 6, studentCode: 'HV005', studentName: 'Vũ Minh Đức', classCode: 'IELTS-2601', sessionNumber: 1, sessionDate: '2026-09-07', isPresent: false, note: 'Ốm, có xin phép' },
  { id: 3, enrollmentId: 1, studentCode: 'HV001', studentName: 'Nguyễn Văn An', classCode: 'IELTS-2601', sessionNumber: 2, sessionDate: '2026-09-09', isPresent: true, note: null },
  { id: 4, enrollmentId: 6, studentCode: 'HV005', studentName: 'Vũ Minh Đức', classCode: 'IELTS-2601', sessionNumber: 2, sessionDate: '2026-09-09', isPresent: true, note: null },
  { id: 5, enrollmentId: 2, studentCode: 'HV002', studentName: 'Trần Thị Bình', classCode: 'TOEIC-2601', sessionNumber: 1, sessionDate: '2026-09-08', isPresent: true, note: null },
]

export const grades: Grade[] = [
  { id: 1, enrollmentId: 1, studentCode: 'HV001', studentName: 'Nguyễn Văn An', classCode: 'IELTS-2601', courseName: 'IELTS Intensive 6.5+', gradingScheme: 'Ielts', examType: 'Midterm', listening: 6.5, reading: 7, writing: 6, speaking: 6.5, overall: 6.5, feedback: 'Tiến bộ tốt, cần luyện thêm Writing Task 2.' },
  { id: 2, enrollmentId: 6, studentCode: 'HV005', studentName: 'Vũ Minh Đức', classCode: 'IELTS-2601', courseName: 'IELTS Intensive 6.5+', gradingScheme: 'Ielts', examType: 'Midterm', listening: 5.5, reading: 6, writing: 5, speaking: 5.5, overall: 5.5, feedback: null },
  { id: 3, enrollmentId: 2, studentCode: 'HV002', studentName: 'Trần Thị Bình', classCode: 'TOEIC-2601', courseName: 'TOEIC 650+', gradingScheme: 'Toeic', examType: 'Placement', listening: 300, reading: 255, writing: null, speaking: null, overall: 555, feedback: null },
]

export const users: User[] = [
  { id: 1, username: 'admin', role: 'Admin', isActive: true, studentId: null, studentName: null, lastLoginAt: '2026-09-23T08:15:00Z' },
  { id: 2, username: 'staff', role: 'Staff', isActive: true, studentId: null, studentName: null, lastLoginAt: '2026-09-23T07:40:00Z' },
  { id: 3, username: 'hv001', role: 'Student', isActive: true, studentId: 1, studentName: 'Nguyễn Văn An', lastLoginAt: '2026-09-22T19:02:00Z' },
  { id: 4, username: 'giaovu02', role: 'Staff', isActive: false, studentId: null, studentName: null, lastLoginAt: null },
]

export const sessionUsers: Record<'Admin' | 'Staff' | 'Student', CurrentUser> = {
  Admin: { id: 1, username: 'admin', role: 'Admin', studentId: null, fullName: null },
  Staff: { id: 2, username: 'staff', role: 'Staff', studentId: null, fullName: null },
  Student: { id: 3, username: 'hv001', role: 'Student', studentId: 1, fullName: 'Nguyễn Văn An' },
}

// Student portal: the signed-in student is Nguyễn Văn An (HV001)
export const myClasses: MyClass[] = [
  { enrollmentId: 1, classCode: 'IELTS-2601', className: 'IELTS tối 2-4-6', courseName: 'IELTS Intensive 6.5+', teacherName: 'Nguyễn Mai Hương', schedule: 'T2-T4-T6 18:00-20:00', room: 'P201', startDate: '2026-09-07', endDate: '2026-12-18', totalSessions: 36, learningStatus: 'Studying', paymentStatus: 'Paid', balance: 0, sessionsAttended: 2, sessionsRecorded: 2 },
  { enrollmentId: 4, classCode: 'GT-2601', className: 'Giao tiếp cuối tuần', courseName: 'Giao tiếp cơ bản', teacherName: 'Trần Minh Đức', schedule: 'T7-CN 09:00-11:00', room: 'P301', startDate: '2026-09-12', endDate: null, totalSessions: 20, learningStatus: 'Studying', paymentStatus: 'Partial', balance: 1_000_000, sessionsAttended: 1, sessionsRecorded: 3 },
]

export const myAttendance: MyAttendance[] = [
  { enrollmentId: 1, classCode: 'IELTS-2601', sessionNumber: 2, sessionDate: '2026-09-09', isPresent: true, note: null },
  { enrollmentId: 1, classCode: 'IELTS-2601', sessionNumber: 1, sessionDate: '2026-09-07', isPresent: true, note: null },
  { enrollmentId: 4, classCode: 'GT-2601', sessionNumber: 3, sessionDate: '2026-09-20', isPresent: false, note: 'Vắng không phép' },
  { enrollmentId: 4, classCode: 'GT-2601', sessionNumber: 2, sessionDate: '2026-09-13', isPresent: false, note: 'Đi công tác' },
  { enrollmentId: 4, classCode: 'GT-2601', sessionNumber: 1, sessionDate: '2026-09-12', isPresent: true, note: null },
]

export const myGrades: MyGrade[] = [
  { enrollmentId: 1, classCode: 'IELTS-2601', courseName: 'IELTS Intensive 6.5+', gradingScheme: 'Ielts', examType: 'Placement', listening: 6, reading: 6, writing: 5.5, speaking: 6, overall: 6, feedback: null },
  { enrollmentId: 1, classCode: 'IELTS-2601', courseName: 'IELTS Intensive 6.5+', gradingScheme: 'Ielts', examType: 'Midterm', listening: 6.5, reading: 7, writing: 6, speaking: 6.5, overall: 6.5, feedback: 'Tiến bộ tốt, cần luyện thêm Writing Task 2.' },
  { enrollmentId: 4, classCode: 'GT-2601', courseName: 'Giao tiếp cơ bản', gradingScheme: 'Standard', examType: 'Progress1', listening: 8, reading: null, writing: null, speaking: 7.5, overall: 7.8, feedback: 'Phát âm rõ ràng.' },
]
