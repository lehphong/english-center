import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BrandMark from '~/components/BrandMark.vue'

/** The brand mark: three rice-terrace steps in golden ochre, set beside the "English Center" name. */
const meta = {
  title: 'Components/Brand/BrandMark',
  component: BrandMark,
  args: { size: 40 },
} satisfies Meta<typeof BrandMark>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const OnUmber: Story = {
  render: (args) => ({
    components: { BrandMark },
    setup: () => ({ args }),
    template: `
      <div style="display:inline-flex;align-items:center;gap:8px;padding:16px 24px;background:var(--umber);color:var(--on-umber);border-radius:var(--radius-md);font-weight:700">
        <BrandMark v-bind="args" /> English Center
      </div>`,
  }),
}
