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

/** Mỗi tone có một hình riêng — tròn, tam giác, vuông, thoi, gạch — để không phải dựa vào màu. */
export const Tones: Story = {
  render: () => ({
    components: { StatusTag },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <StatusTag tone="success" label="Thành công" />
        <StatusTag tone="warning" label="Cảnh báo" />
        <StatusTag tone="danger" label="Lỗi" />
        <StatusTag tone="info" label="Thông tin" />
        <StatusTag tone="neutral" label="Trung tính" />
      </div>`,
  }),
}

/** Trạng thái nghiệp vụ lấy tone cố định trong component — dùng `group` + `value`, không tự chọn màu. */
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
