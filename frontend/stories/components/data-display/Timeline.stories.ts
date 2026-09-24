import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * `ElTimeline`: the history of one record, newest first (an enrollment's payments and status changes).
 * Node colors follow the same meaning as `StatusTag`; neutral events keep the default node.
 */
const meta = {
  title: 'Components/Data display/Timeline',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const History: Story = {
  render: () => ({
    setup: () => ({
      events: [
        { time: '24/09/2026 18:40', text: 'Đóng thêm 2.000.000 ₫ (còn nợ 1.500.000 ₫)', type: 'success' },
        { time: '15/09/2026 09:12', text: 'Bảo lưu 2 tuần theo đơn của học viên', type: 'warning' },
        { time: '07/09/2026 18:30', text: 'Buổi học đầu tiên' },
        { time: '01/09/2026 10:05', text: 'Ghi danh vào IELTS-2601, đóng 3.000.000 ₫', type: 'primary' },
      ],
    }),
    template: `
      <el-timeline style="max-width:520px;padding-left:0">
        <el-timeline-item v-for="e in events" :key="e.time" :timestamp="e.time" :type="e.type">{{ e.text }}</el-timeline-item>
      </el-timeline>`,
  }),
}
