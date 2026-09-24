import type { Meta, StoryObj } from '@storybook/vue3-vite'
import PageHeader from '~/components/PageHeader.vue'

const placeholder = {
  components: { PageHeader },
  template: `
    <div class="page">
      <PageHeader title="Page title" subtitle="Page content renders here." />
      <el-card shadow="never"><p class="muted" style="margin:0">Each page slots into the layout.</p></el-card>
    </div>`,
}

/**
 * The three app shells. `default` frames the management screens with the earth-brown sidebar (the 30% structure),
 * `portal` frames the student pages with a top bar, `auth` frames sign-in with the terraced-field panel.
 */
const meta = {
  title: 'Layouts',
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: () => placeholder,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Admin: Story = {
  parameters: { nuxt: { layout: 'default', session: 'Admin', route: { path: '/courses' } } },
}

/** Academic staff do not see the Accounts menu. */
export const AdminAsStaff: Story = {
  parameters: { nuxt: { layout: 'default', session: 'Staff', route: { path: '/enrollments' } } },
}

export const StudentPortal: Story = {
  parameters: { nuxt: { layout: 'portal', session: 'Student', route: { path: '/portal/grades' } } },
}

export const SignIn: Story = {
  parameters: { nuxt: { layout: 'auth' } },
  render: () => ({ template: '<div style="padding:32px;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-lg)">Sign-in form</div>' }),
}
