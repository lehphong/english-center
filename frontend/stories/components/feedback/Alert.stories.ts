import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * `ElAlert`: a message that stays on the page, attached to the content it is about.
 * Colors are semantic: `success` moss green, `warning` burnt orange, `error` red, `info` the information blue.
 * Always keep the icon (`show-icon`), so the meaning does not rely on color alone. Use the light effect only.
 * For "it worked" after an action, use a Message toast instead; alerts are for conditions that persist.
 */
const meta = {
  title: 'Components/Feedback/Alert',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Types: Story = {
  render: () => ({
    template: `
      <div class="sb-stack" style="max-width:640px">
        <el-alert type="info" show-icon :closable="false" title="Lớp khai giảng ngày 07/09/2026, học vào tối thứ 2-4-6." />
        <el-alert type="success" show-icon :closable="false" title="Học viên đã đóng đủ học phí." />
        <el-alert type="warning" show-icon :closable="false" title="Lớp còn 1 chỗ trống." />
        <el-alert type="error" show-icon :closable="false" title="Lớp đã đủ 15 học viên, không thể ghi danh thêm." />
      </div>`,
  }),
}

/** A title plus a description when the reader needs to know what to do next. */
export const WithDescription: Story = {
  render: () => ({
    template: `
      <el-alert type="warning" show-icon :closable="false" style="max-width:640px"
        title="Chuyên cần dưới 80%"
        description="Học viên đã vắng 5/24 buổi. Nếu vắng thêm 1 buổi sẽ không đủ điều kiện dự kiểm tra cuối kỳ." />`,
  }),
}

/** Dismissible notices go away for the session; don't make errors that still apply dismissible. */
export const Closable: Story = {
  render: () => ({
    template: `
      <el-alert type="info" show-icon close-text="Đã hiểu" style="max-width:640px"
        title="Từ tháng 10, điểm danh phải được lưu trong ngày học." />`,
  }),
}
