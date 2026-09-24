import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

/**
 * `ElTabs`: switch between views of the same record (a class's students / attendance / grades) without leaving the
 * page. The active tab is `ochre-ink` text on an `ochre-ink` bar. Keep 2–6 short tab labels; for navigation between
 * pages use the sidebar.
 */
const meta = {
  title: 'Components/Navigation/Tabs',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Line: Story = {
  render: () => ({
    setup: () => ({ tab: ref('students') }),
    template: `
      <el-tabs v-model="tab" style="max-width:640px">
        <el-tab-pane label="Học viên (12)" name="students">Danh sách 12 học viên của lớp.</el-tab-pane>
        <el-tab-pane label="Điểm danh" name="attendance">Lịch sử điểm danh 24 buổi.</el-tab-pane>
        <el-tab-pane label="Bảng điểm" name="grades">Điểm giữa kỳ và cuối kỳ.</el-tab-pane>
        <el-tab-pane label="Tài liệu" name="files" disabled>Sắp có.</el-tab-pane>
      </el-tabs>`,
  }),
}

/** Card tabs sit on top of a bordered panel, for settings pages. */
export const BorderCard: Story = {
  render: () => ({
    setup: () => ({ tab: ref('profile') }),
    template: `
      <el-tabs v-model="tab" type="border-card" style="max-width:640px">
        <el-tab-pane label="Hồ sơ" name="profile">Thông tin cá nhân của học viên.</el-tab-pane>
        <el-tab-pane label="Học phí" name="fees">Các lần đóng học phí.</el-tab-pane>
        <el-tab-pane label="Tài khoản" name="account">Tên đăng nhập và mật khẩu.</el-tab-pane>
      </el-tabs>`,
  }),
}
