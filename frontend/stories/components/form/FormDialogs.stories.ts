import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ChangePasswordDialog from '~/components/ChangePasswordDialog.vue'
import ClassFormDialog from '~/components/ClassFormDialog.vue'
import CourseFormDialog from '~/components/CourseFormDialog.vue'
import EnrollmentFormDialog from '~/components/EnrollmentFormDialog.vue'
import ResetPasswordDialog from '~/components/ResetPasswordDialog.vue'
import StudentFormDialog from '~/components/StudentFormDialog.vue'
import UserFormDialog from '~/components/UserFormDialog.vue'
import { classes, courses, enrollments, students, users } from '../../../.storybook/mocks/data'
import { openAfterMount } from '../../helpers'

/**
 * Create / edit dialogs of the management screens. Each one validates in the browser with translated rules and
 * then calls the API; saving here goes to the mocked API and is logged in the Actions panel.
 */
const meta = {
  title: 'Components/Form/Form dialogs',
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen', nuxt: { session: 'Admin' } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const NewCourse: Story = { render: openAfterMount(CourseFormDialog) }
export const EditCourse: Story = { render: openAfterMount(CourseFormDialog, { course: courses[0] }) }

/** Loads the active courses when it opens. */
export const NewClass: Story = { render: openAfterMount(ClassFormDialog) }
export const EditClass: Story = { render: openAfterMount(ClassFormDialog, { courseClass: classes[0] }) }

/** The optional login account appears only when "Create login account" is ticked. */
export const NewStudent: Story = { render: openAfterMount(StudentFormDialog) }
export const EditStudent: Story = { render: openAfterMount(StudentFormDialog, { student: students[0] }) }

/** Leaving tuition empty uses the course's listed fee; the balance updates as amounts change. */
export const NewEnrollment: Story = { render: openAfterMount(EnrollmentFormDialog) }
export const EditEnrollment: Story = { render: openAfterMount(EnrollmentFormDialog, { enrollment: enrollments[1] }) }

/** Choosing the Student role asks for the linked student (only students without an account are listed). */
export const NewAccount: Story = { render: openAfterMount(UserFormDialog) }
export const EditStudentAccount: Story = { render: openAfterMount(UserFormDialog, { user: users[2] }) }

export const ResetPassword: Story = { render: openAfterMount(ResetPasswordDialog, { user: users[1] }) }

export const ChangePassword: Story = { render: openAfterMount(ChangePasswordDialog) }
