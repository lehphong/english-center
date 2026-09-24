import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * `ElEmpty`: nothing to show yet. Say what is missing in plain words and offer the next step
 * (a primary button when creating is the natural next step, otherwise none). No blame, no jokes.
 */
const meta = {
  title: 'Components/Data display/Empty',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const FirstUse: Story = {
  render: () => ({
    template: `
      <el-card shadow="never">
        <el-empty description="Chưa có khóa học nào. Tạo khóa học đầu tiên để mở lớp.">
          <el-button type="primary">Thêm khóa học</el-button>
        </el-empty>
      </el-card>`,
  }),
}

export const NoResults: Story = {
  render: () => ({
    template: `
      <el-card shadow="never">
        <el-empty description="Không tìm thấy kết quả cho “IELTS 8.0”" :image-size="80">
          <el-button type="primary" plain>Xóa bộ lọc</el-button>
        </el-empty>
      </el-card>`,
  }),
}

/** In the student portal: a fact, no action needed. */
export const NothingYet: Story = {
  render: () => ({
    template: `
      <el-card shadow="never">
        <el-empty description="Bạn chưa có điểm kiểm tra nào" :image-size="64" />
      </el-card>`,
  }),
}
