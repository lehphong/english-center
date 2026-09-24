import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ElMessageBox } from 'element-plus'
import { expect, userEvent, waitFor, within } from 'storybook/test'

/**
 * `ElMessageBox`: asks before an action that cannot be undone. The title names the action, the message names the
 * object, and the confirm button repeats the verb (*Xóa*, not *OK*). Destructive confirms use a danger button.
 */
const meta = {
  title: 'Components/Feedback/Message box',
  beforeEach: () => () => ElMessageBox.close(),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const confirmDelete = () =>
  ElMessageBox.confirm('Xóa khóa học “Tiếng Anh thiếu nhi”? Thao tác này không thể hoàn tác.', 'Xóa khóa học', {
    type: 'warning',
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
    confirmButtonClass: 'el-button--danger',
  }).catch(() => {})

const alertDone = () =>
  ElMessageBox.alert('Đã gửi mật khẩu tạm thời tới email của học viên.', 'Đặt lại mật khẩu', {
    type: 'success',
    confirmButtonText: 'Đóng',
  }).catch(() => {})

const promptReason = () =>
  ElMessageBox.prompt('Lý do bảo lưu sẽ được lưu vào lịch sử ghi danh.', 'Bảo lưu', {
    confirmButtonText: 'Bảo lưu',
    cancelButtonText: 'Hủy',
    inputPlaceholder: 'Ví dụ: đi công tác 2 tuần',
    inputPattern: /\S+/,
    inputErrorMessage: 'Vui lòng nhập lý do',
  }).catch(() => {})

/** The destructive confirmation used for every delete. */
export const ConfirmDelete: Story = {
  render: () => ({ setup: () => ({ confirmDelete }), template: '<el-button type="danger" plain @click="confirmDelete">Xóa khóa học</el-button>' }),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Xóa khóa học' }))
    await waitFor(() => expect(within(document.body).getByRole('dialog')).toBeVisible())
  },
}

export const Alert: Story = {
  render: () => ({ setup: () => ({ alertDone }), template: '<el-button @click="alertDone">Đặt lại mật khẩu</el-button>' }),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Đặt lại mật khẩu' }))
    await waitFor(() => expect(within(document.body).getByRole('dialog')).toBeVisible())
  },
}

/** Asks for one short value; anything longer deserves a dialog with a form. */
export const Prompt: Story = {
  render: () => ({ setup: () => ({ promptReason }), template: '<el-button @click="promptReason">Bảo lưu</el-button>' }),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Bảo lưu' }))
    await waitFor(() => expect(within(document.body).getByRole('dialog')).toBeVisible())
  },
}
