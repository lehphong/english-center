import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * `ElResult`: the outcome of a whole page or flow: access denied, page not found, enrollment completed.
 * One sentence of explanation and one way forward. The app's 403 and 404 pages use it.
 */
const meta = {
  title: 'Components/Feedback/Result',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  render: () => ({
    template: `
      <el-result icon="success" title="Ghi danh thành công" sub-title="Nguyễn Văn An đã được xếp vào lớp IELTS-2601.">
        <template #extra>
          <el-button>Ghi danh học viên khác</el-button>
          <el-button type="primary">Xem lớp</el-button>
        </template>
      </el-result>`,
  }),
}

export const Forbidden: Story = {
  render: () => ({
    template: `
      <el-result icon="warning" title="403" sub-title="Bạn không có quyền truy cập trang này.">
        <template #extra><el-button type="primary">Về trang chủ</el-button></template>
      </el-result>`,
  }),
}

export const LoadFailed: Story = {
  render: () => ({
    template: `
      <el-result icon="error" title="Không tải được dữ liệu" sub-title="Kiểm tra kết nối mạng rồi thử lại.">
        <template #extra><el-button type="primary">Thử lại</el-button></template>
      </el-result>`,
  }),
}

export const Info: Story = {
  render: () => ({
    template: `
      <el-result icon="info" title="Chưa đến lịch kiểm tra" sub-title="Điểm giữa kỳ sẽ có sau ngày 20/10/2026." />`,
  }),
}
