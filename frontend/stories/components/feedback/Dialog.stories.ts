import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { reactive, ref } from 'vue'

/**
 * `ElDialog`: a focused task that must be finished or cancelled before returning to the page: create or edit one
 * record. Width 560px for one column of fields, 720px for the two-column `.form-grid`. The footer holds *Cancel*
 * then the primary action. `close-on-click-modal` is off for forms, so a stray click never loses typed data.
 * The real app dialogs are in **Components › Form › Form dialogs**.
 */
const meta = {
  title: 'Components/Feedback/Dialog',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const openOnPlay = (name: string): Story['play'] => async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name }))
  await waitFor(() => expect(within(document.body).getByRole('dialog')).toBeVisible())
}

export const FormDialog: Story = {
  render: () => ({
    setup: () => ({ open: ref(false), form: reactive({ name: '', room: '' }) }),
    template: `
      <el-button type="primary" @click="open = true">Thêm lớp học</el-button>
      <el-dialog v-model="open" title="Thêm lớp học" width="560px" :close-on-click-modal="false">
        <el-form label-position="top">
          <el-form-item label="Tên lớp" required for="class-name"><el-input id="class-name" v-model="form.name" placeholder="IELTS tối 2-4-6" /></el-form-item>
          <el-form-item label="Phòng học" for="room"><el-input id="room" v-model="form.room" placeholder="302" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="open = false">Hủy</el-button>
          <el-button type="primary" @click="open = false">Lưu</el-button>
        </template>
      </el-dialog>`,
  }),
  play: openOnPlay('Thêm lớp học'),
}

/** Read-only details that need more room than a tooltip; a single *Close* button. */
export const Details: Story = {
  render: () => ({
    setup: () => ({ open: ref(false) }),
    template: `
      <el-button @click="open = true">Xem quy chế</el-button>
      <el-dialog v-model="open" title="Quy chế bảo lưu" width="560px">
        <p style="margin-top:0">Mỗi khóa được bảo lưu tối đa 2 lần, mỗi lần không quá 3 tháng.</p>
        <p style="margin-bottom:0">Thời gian bảo lưu không tính vào thời hạn khóa học.</p>
        <template #footer><el-button @click="open = false">Đóng</el-button></template>
      </el-dialog>`,
  }),
  play: openOnPlay('Xem quy chế'),
}
