import { Bell, Message } from '@element-plus/icons-vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * `ElBadge`: a count or a dot that asks for attention (pending requests, unread notices).
 * Danger red means "needs action"; use `info` for counts that are only informative. Hide the badge at zero.
 * When the badge sits on an icon button, put the count in the button's `aria-label` as well.
 */
const meta = {
  title: 'Components/Data display/Badge',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Count: Story = {
  render: () => ({
    setup: () => ({ Bell, Message }),
    template: `
      <div class="sb-row" style="gap:32px">
        <el-badge :value="3"><el-button :icon="Bell" circle aria-label="Thông báo, 3 chưa đọc" /></el-badge>
        <el-badge :value="128" :max="99"><el-button :icon="Message" circle aria-label="Tin nhắn, hơn 99 chưa đọc" /></el-badge>
        <el-badge :value="5" type="info"><el-button>Chờ xếp lớp</el-button></el-badge>
        <el-badge :value="0" :show-zero="false"><el-button>Đơn bảo lưu</el-button></el-badge>
      </div>`,
  }),
}

/** A dot when the number doesn't matter, only that something changed. */
export const Dot: Story = {
  render: () => ({
    template: `
      <div class="sb-row" style="gap:32px">
        <el-badge is-dot><span>Lịch học mới</span></el-badge>
        <el-badge is-dot type="warning"><span>Sắp hết hạn đóng học phí</span></el-badge>
      </div>`,
  }),
}
