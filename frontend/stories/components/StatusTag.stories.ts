import type { Meta, StoryObj } from '@storybook/vue3-vite'
import StatusTag from '~/components/StatusTag.vue'
import { LEARNING_STATUSES, PAYMENT_STATUSES } from '~/types/enums'

const meta = {
  title: 'Components/StatusTag',
  component: StatusTag,
  argTypes: {
    tone: { control: 'select', options: ['success', 'warning', 'danger', 'info', 'neutral'] },
    label: { control: 'text' },
  },
  args: { tone: 'success', label: 'Đã đóng đủ' },
} satisfies Meta<typeof StatusTag>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Each tone has its own shape — circle, triangle, square, diamond, dash — so color is never the only signal. */
export const Tones: Story = {
  render: () => ({
    components: { StatusTag },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <StatusTag tone="success" label="Success" />
        <StatusTag tone="warning" label="Warning" />
        <StatusTag tone="danger" label="Error" />
        <StatusTag tone="info" label="Information" />
        <StatusTag tone="neutral" label="Neutral" />
      </div>`,
  }),
}

/** Business states get a fixed tone inside the component — pass `group` + `value`, never pick a color. */
export const BusinessStatuses: Story = {
  render: () => ({
    components: { StatusTag },
    setup: () => ({ payments: PAYMENT_STATUSES, learning: LEARNING_STATUSES }),
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <StatusTag v-for="v in payments" :key="v" group="paymentStatus" :value="v" />
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <StatusTag v-for="v in learning" :key="v" group="learningStatus" :value="v" />
        </div>
      </div>`,
  }),
}
