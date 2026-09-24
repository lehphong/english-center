import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import AttendanceHistoryPage from '~/pages/attendance/history.vue'
import AttendancePage from '~/pages/attendance/index.vue'
import ClassDetailPage from '~/pages/classes/[id].vue'
import ClassesPage from '~/pages/classes/index.vue'
import CoursesPage from '~/pages/courses/index.vue'
import DashboardPage from '~/pages/dashboard.vue'
import EnrollmentsPage from '~/pages/enrollments/index.vue'
import GradebookPage from '~/pages/grades/history.vue'
import GradesPage from '~/pages/grades/index.vue'
import StudentDetailPage from '~/pages/students/[id].vue'
import StudentsPage from '~/pages/students/index.vue'
import UsersPage from '~/pages/users/index.vue'
import { apiIdle } from '../../.storybook/mocks/http'
import type { NuxtStoryParameters } from '../../.storybook/preview'

/** Every management screen in the admin shell, signed in as an administrator, with sample data. */
const meta = {
  title: 'Pages/Management',
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const page = (component: object, route: NuxtStoryParameters['route'], session: NuxtStoryParameters['session'] = 'Admin'): Story => ({
  parameters: { nuxt: { layout: 'default', session, route } },
  render: () => ({ components: { Page: component }, template: '<Page />' }),
  // Wait for the page's data, so the accessibility check sees the filled page
  play: apiIdle,
})

/** One accent figure (tuition collected); the other metrics stay in ink. */
export const Dashboard = page(DashboardPage, { path: '/dashboard' })

export const Courses = page(CoursesPage, { path: '/courses' })

/** Deleting a course that still has classes is refused by the API; the error is shown translated. */
export const CourseDeleteRefused: Story = {
  ...Courses,
  play: async ({ canvasElement }) => {
    await apiIdle()
    const canvas = within(canvasElement)
    const deleteButtons = await canvas.findAllByRole('button', { name: 'Xóa' })
    await userEvent.click(deleteButtons[0]!)
    const dialog = await within(document.body).findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Xóa' }))
    await waitFor(() => expect(within(document.body).getByText('Không thể xóa khóa học đã có lớp')).toBeVisible())
  },
}

/** A full class shows its head-count as a danger tag. */
export const Classes = page(ClassesPage, { path: '/classes' })
export const ClassDetail = page(ClassDetailPage, { path: '/classes/1', params: { id: '1' } })

export const Students = page(StudentsPage, { path: '/students' })
export const StudentDetail = page(StudentDetailPage, { path: '/students/1', params: { id: '1' } })

/** Every payment and learning state appears in the sample data. */
export const Enrollments = page(EnrollmentsPage, { path: '/enrollments' })

export const TakeAttendance = page(AttendancePage, { path: '/attendance', query: { classId: '1' } })
export const AttendanceHistory = page(AttendanceHistoryPage, { path: '/attendance/history' })

/** IELTS scale: 0–9 in steps of 0.5; the overall band previews as scores are typed. */
export const GradeEntry = page(GradesPage, { path: '/grades', query: { classId: '1' } })
export const Gradebook = page(GradebookPage, { path: '/grades/history' })

/** Administrators only; your own account cannot be deleted. */
export const Accounts = page(UsersPage, { path: '/users' })
