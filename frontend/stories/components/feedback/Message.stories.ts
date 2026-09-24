import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ElMessage } from 'element-plus'
import { expect, userEvent, waitFor, within } from 'storybook/test'

/**
 * `ElMessage`: a short toast at the top after an action: *Đã lưu*, *Đã xóa*, or an API error translated by
 * `useApiErrors()`. It disappears on its own (3s, errors 5s), so never put anything the user must act on in it.
 */
const meta = {
  title: 'Components/Feedback/Message',
  beforeEach: () => () => ElMessage.closeAll(),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const show = {
  success: () => ElMessage.success({ message: 'Đã lưu', duration: 0 }),
  info: () => ElMessage.info({ message: 'Không có thay đổi nào để lưu', duration: 0 }),
  warning: () => ElMessage.warning({ message: 'Lớp sắp hết chỗ', duration: 0 }),
  error: () => ElMessage.error({ message: 'Không thể xóa khóa học đã có lớp', duration: 0, showClose: true }),
}

/** Press a button to show the toast; the story opens all four so they can be compared. */
export const Types: Story = {
  render: () => ({
    setup: () => ({ show }),
    template: `
      <div class="sb-row">
        <el-button @click="show.success()">Thành công</el-button>
        <el-button @click="show.info()">Thông tin</el-button>
        <el-button @click="show.warning()">Cảnh báo</el-button>
        <el-button @click="show.error()">Lỗi</el-button>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const name of ['Thành công', 'Thông tin', 'Cảnh báo', 'Lỗi']) {
      await userEvent.click(canvas.getByRole('button', { name }))
    }
    await waitFor(() => expect(within(document.body).getByText('Không thể xóa khóa học đã có lớp')).toBeVisible())
  },
}
