import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import ErrorPage from '~/error.vue'
import ForbiddenPage from '~/pages/forbidden.vue'
import LoginPage from '~/pages/login.vue'

const meta = {
  title: 'Pages/Sign-in and errors',
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Sample accounts: admin, staff, hv001 — password Passw0rd! */
export const SignIn: Story = {
  parameters: { nuxt: { layout: 'auth', route: { path: '/login' } } },
  render: () => ({ components: { LoginPage }, template: '<LoginPage />' }),
}

/** Submitting an empty form shows both required-field messages. */
export const SignInRequiredFields: Story = {
  ...SignIn,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Đăng nhập' }))
    await waitFor(() => expect(canvas.getAllByText('Vui lòng nhập trường này')).toHaveLength(2))
  },
}

/** A wrong password comes back from the API as `auth.invalidCredentials` and is shown translated. */
export const SignInWrongPassword: Story = {
  ...SignIn,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(await canvas.findByLabelText('Tên đăng nhập'), 'admin')
    await userEvent.type(canvas.getByLabelText('Mật khẩu'), 'wrong-password')
    await userEvent.click(canvas.getByRole('button', { name: 'Đăng nhập' }))
    await waitFor(() => expect(within(document.body).getByText('Sai tên đăng nhập hoặc mật khẩu')).toBeVisible())
  },
}

/** Where the route guard sends a signed-in user who lacks the page's role. */
export const Forbidden: Story = {
  parameters: { nuxt: { layout: 'auth', session: 'Staff', route: { path: '/forbidden' } } },
  render: () => ({ components: { ForbiddenPage }, template: '<ForbiddenPage />' }),
}

export const NotFound: Story = {
  render: () => ({
    components: { ErrorPage },
    setup: () => ({ error: { statusCode: 404, message: 'Page not found' } }),
    template: '<ErrorPage :error="error" />',
  }),
}
