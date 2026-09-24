import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

/**
 * `ElDrawer`: side information while keeping the list in view (a quick look at a student from the enrollment list,
 * advanced filters). Slides in from the right, 420–560px wide. A task that must be finished belongs in a dialog.
 */
const meta = {
  title: 'Components/Feedback/Drawer',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const QuickView: Story = {
  render: () => ({
    setup: () => ({ open: ref(false) }),
    template: `
      <el-button @click="open = true">Xem nhanh học viên</el-button>
      <el-drawer v-model="open" title="Nguyễn Văn An · HV001" size="480px">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Email">an.nguyen@example.com</el-descriptions-item>
          <el-descriptions-item label="Số điện thoại"><span class="num">0912 345 678</span></el-descriptions-item>
          <el-descriptions-item label="Lớp đang học">IELTS-2601</el-descriptions-item>
          <el-descriptions-item label="Chuyên cần"><span class="num">22/24 buổi</span></el-descriptions-item>
        </el-descriptions>
        <template #footer>
          <el-button @click="open = false">Đóng</el-button>
          <el-button type="primary">Mở hồ sơ</el-button>
        </template>
      </el-drawer>`,
  }),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Xem nhanh học viên' }))
    await waitFor(() => expect(within(document.body).getByRole('dialog')).toBeVisible())
  },
}
