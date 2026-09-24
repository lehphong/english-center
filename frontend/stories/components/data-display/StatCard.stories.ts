import type { Meta, StoryObj } from '@storybook/vue3-vite'
import StatCard from '~/components/StatCard.vue'
import StatusTag from '~/components/StatusTag.vue'

const meta = {
  title: 'Components/Data display/StatCard',
  component: StatCard,
  args: { label: 'Học phí đã thu', value: '13.500.000 ₫', accent: false },
} satisfies Meta<typeof StatCard>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Only one card per screen is `accent` — the figure people should see first. */
export const Dashboard: Story = {
  render: () => ({
    components: { StatCard, StatusTag },
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px">
        <StatCard label="Học phí đã thu" value="13.500.000 ₫" accent />
        <StatCard label="Học phí còn nợ" value="6.500.000 ₫">
          <StatusTag tone="danger" label="2 học viên chưa đóng" />
        </StatCard>
        <StatCard label="Lượt ghi danh" value="4" hint="Đang học và bảo lưu" />
      </div>`,
  }),
}
