import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'
import ThemeSwitcher from '~/components/ThemeSwitcher.vue'
import UserMenu from '~/components/UserMenu.vue'

/** The controls on the right of the app header: theme, language and the signed-in user. */
const meta = {
  title: 'Components/Navigation/Header controls',
  parameters: { nuxt: { session: 'Admin' } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Header: Story = {
  render: () => ({
    components: { ThemeSwitcher, LanguageSwitcher, UserMenu },
    template: `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-md)">
        <ThemeSwitcher /><LanguageSwitcher /><UserMenu />
      </div>`,
  }),
}

/** Remembers the choice in a cookie; the button names the theme it switches to. */
export const Theme: Story = {
  render: () => ({ components: { ThemeSwitcher }, template: '<ThemeSwitcher />' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const before = canvas.getByRole('button').getAttribute('aria-label')
    await userEvent.click(canvas.getByRole('button'))
    await expect(canvas.getByRole('button').getAttribute('aria-label')).not.toBe(before)
  },
}

export const Language: Story = {
  render: () => ({ components: { LanguageSwitcher }, template: '<LanguageSwitcher />' }),
}

/** Shows the student's full name when a student is signed in, otherwise the username and role. */
export const UserMenuForStudent: Story = {
  parameters: { nuxt: { session: 'Student' } },
  render: () => ({ components: { UserMenu }, template: '<UserMenu />' }),
}
