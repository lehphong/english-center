import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ElNotification } from 'element-plus'
import { expect, userEvent, waitFor, within } from 'storybook/test'

/**
 * `ElNotification`: news the user did not directly cause, with a title and a sentence of detail
 * (a background export finished, a class schedule changed). Top-right, closable.
 * For the result of the user's own action, use a Message toast.
 */
const meta = {
  title: 'Components/Feedback/Notification',
  beforeEach: () => () => ElNotification.closeAll(),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const show = {
  info: () => ElNotification.info({ title: 'Đổi phòng học', message: 'Lớp IELTS-2601 chuyển sang phòng 305 từ buổi 13.', duration: 0 }),
  success: () => ElNotification.success({ title: 'Xuất file xong', message: 'danh-sach-hoc-vien.xlsx đã sẵn sàng để tải.', duration: 0 }),
  warning: () => ElNotification.warning({ title: 'Sắp hết hạn học phí', message: '3 học viên đến hạn đóng học phí trong tuần này.', duration: 0 }),
}

export const Types: Story = {
  render: () => ({
    setup: () => ({ show }),
    template: `
      <div class="sb-row">
        <el-button @click="show.info()">Thông tin</el-button>
        <el-button @click="show.success()">Thành công</el-button>
        <el-button @click="show.warning()">Cảnh báo</el-button>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const name of ['Thông tin', 'Thành công', 'Cảnh báo']) {
      await userEvent.click(canvas.getByRole('button', { name }))
    }
    await waitFor(() => expect(within(document.body).getByText('Đổi phòng học')).toBeVisible())
  },
}
