import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { reactive, ref } from 'vue'

/**
 * One choice out of 2–5 visible options.
 * - **Radio**: options that need reading (a label or a sentence).
 * - **Radio button** (segmented): short options that switch a mode, like gender or role. The selected segment is an
 *   ochre fill with `on-ochre` text: the same "accent fill" as the primary button.
 * - **Segmented**: switching between views of the same data.
 * More than 5 options → a select.
 */
const meta = {
  title: 'Components/Form/Radio',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Radio: Story = {
  render: () => ({
    setup: () => ({ scheme: ref('Ielts') }),
    template: `
      <el-form label-position="top" class="sb-narrow">
        <el-form-item label="Thang điểm">
          <el-radio-group v-model="scheme" aria-label="Thang điểm">
            <el-radio value="Ielts">IELTS (0–9)</el-radio>
            <el-radio value="Toeic">TOEIC (0–990)</el-radio>
            <el-radio value="TenPoint">Thang 10</el-radio>
            <el-radio value="Cefr" disabled>CEFR (sắp có)</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>`,
  }),
}

export const RadioButton: Story = {
  render: () => ({
    setup: () => ({ s: reactive({ gender: 'Female', role: 'Staff' }) }),
    template: `
      <el-form label-position="top" class="sb-narrow">
        <el-form-item label="Giới tính">
          <el-radio-group v-model="s.gender" aria-label="Giới tính">
            <el-radio-button value="Male">Nam</el-radio-button>
            <el-radio-button value="Female">Nữ</el-radio-button>
            <el-radio-button value="Other">Khác</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Vai trò">
          <el-radio-group v-model="s.role" size="small" aria-label="Vai trò">
            <el-radio-button value="Admin">Quản trị viên</el-radio-button>
            <el-radio-button value="Staff">Giáo vụ</el-radio-button>
            <el-radio-button value="Student" disabled>Học viên</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>`,
  }),
}

export const Segmented: Story = {
  render: () => ({
    setup: () => ({
      view: ref('week'),
      options: [
        { value: 'day', label: 'Ngày' },
        { value: 'week', label: 'Tuần' },
        { value: 'month', label: 'Tháng' },
      ],
    }),
    template: '<el-segmented v-model="view" :options="options" aria-label="Chế độ xem lịch" />',
  }),
}

export const Bordered: Story = {
  render: () => ({
    setup: () => ({ exam: ref('Midterm') }),
    template: `
      <el-radio-group v-model="exam" aria-label="Kỳ kiểm tra">
        <el-radio value="Placement" border>Đầu vào</el-radio>
        <el-radio value="Midterm" border>Giữa kỳ</el-radio>
        <el-radio value="Final" border>Cuối kỳ</el-radio>
      </el-radio-group>`,
  }),
}
