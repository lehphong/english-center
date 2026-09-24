import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

/**
 * `ElPopover`: richer content than a tooltip, opened on click: a preview of a class, a small breakdown of a number.
 * Put the heading in the content instead of the `title` prop: Element Plus gives the title an invalid `role="title"`.
 * `ElPopconfirm`: a light inline confirmation for actions that are easy to redo (remove a filter preset,
 * unlock an account). Deleting records uses the Message box instead.
 */
const meta = {
  title: 'Components/Feedback/Popover',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Breakdown: Story = {
  render: () => ({
    template: `
      <el-popover trigger="click" :width="260">
        <template #reference><el-button>Chi tiết học phí</el-button></template>
        <strong>Còn nợ 3.500.000 ₫</strong>
        <el-descriptions :column="1" size="small">
          <el-descriptions-item label="Học phí"><span class="num">8.500.000 ₫</span></el-descriptions-item>
          <el-descriptions-item label="Đã đóng"><span class="num">5.000.000 ₫</span></el-descriptions-item>
        </el-descriptions>
      </el-popover>`,
  }),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Chi tiết học phí' }))
    await waitFor(() => expect(within(document.body).getByText('Còn nợ 3.500.000 ₫')).toBeVisible())
  },
}

export const Popconfirm: Story = {
  render: () => ({
    template: `
      <el-popconfirm title="Mở khóa tài khoản hv004?" confirm-button-text="Mở khóa" cancel-button-text="Hủy" :width="240">
        <template #reference><el-button type="primary" link>Mở khóa</el-button></template>
      </el-popconfirm>`,
  }),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Mở khóa' }))
    await waitFor(() => expect(within(document.body).getByText('Mở khóa tài khoản hv004?')).toBeVisible())
  },
}
