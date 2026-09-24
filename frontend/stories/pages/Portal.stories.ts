import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MyAttendancePage from '~/pages/portal/attendance.vue'
import MyGradesPage from '~/pages/portal/grades.vue'
import MyClassesPage from '~/pages/portal/index.vue'
import MyProfilePage from '~/pages/portal/profile.vue'
import { apiIdle } from '../../.storybook/mocks/http'
import type { NuxtStoryParameters } from '../../.storybook/preview'

/** The student self-service portal, signed in as Nguyễn Văn An (hv001). */
const meta = {
  title: 'Pages/Student portal',
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const page = (component: object, route: NuxtStoryParameters['route']): Story => ({
  parameters: { nuxt: { layout: 'portal', session: 'Student', route } },
  render: () => ({ components: { Page: component }, template: '<Page />' }),
  // Wait for the page's data, so the accessibility check sees the filled page
  play: apiIdle,
})

/** Attendance below 80% turns the progress bar to warning. */
export const MyClasses = page(MyClassesPage, { path: '/portal' })
export const MyAttendance = page(MyAttendancePage, { path: '/portal/attendance' })
export const MyGrades = page(MyGradesPage, { path: '/portal/grades' })
export const MyProfile = page(MyProfilePage, { path: '/portal/profile' })
