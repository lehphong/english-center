import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { reactive } from 'vue'

/**
 * `ElSelect`: pick from a known list. Use `filterable` once there are more than about 7 options (classes, students),
 * `clearable` in filter bars so "all" is one click away, and radio buttons instead when there are 2–4 options that
 * should all be visible.
 */
const meta = {
  title: 'Components/Form/Select',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const classes = [
  { value: 1, label: 'IELTS-2601 - IELTS tối 2-4-6' },
  { value: 2, label: 'IELTS-2602 - IELTS cuối tuần' },
  { value: 3, label: 'TOEIC-2601 - TOEIC sáng 3-5' },
  { value: 4, label: 'GT-2601 - Giao tiếp cơ bản (đã đủ)', disabled: true },
]

export const Single: Story = {
  render: () => ({
    setup: () => ({ form: reactive({ level: 'Intermediate', classId: 1 }), classes }),
    template: `
      <el-form label-position="top" class="sb-narrow">
        <el-form-item label="Trình độ đầu vào" for="level">
          <el-select id="level" v-model="form.level">
            <el-option value="Beginner" label="Mất gốc" />
            <el-option value="Elementary" label="Sơ cấp" />
            <el-option value="Intermediate" label="Trung cấp" />
            <el-option value="Advanced" label="Nâng cao" />
          </el-select>
        </el-form-item>
        <el-form-item label="Lớp" for="class">
          <el-select id="class" v-model="form.classId" filterable placeholder="Chọn">
            <el-option v-for="c in classes" :key="c.value" v-bind="c" />
          </el-select>
        </el-form-item>
      </el-form>`,
  }),
}

/** Full classes stay in the list but are disabled, so staff can see why a class is missing. */
export const Open: Story = {
  ...Single,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getAllByRole('combobox')[1]!)
    await waitFor(() => expect(within(document.body).getByRole('option', { name: /GT-2601/ })).toHaveAttribute('aria-disabled', 'true'))
  },
}

/** In a filter bar the placeholder names the filter; clearing it means "all". */
export const Filter: Story = {
  render: () => ({
    setup: () => ({ q: reactive({ status: undefined, payment: 'Partial' }) }),
    template: `
      <div class="sb-row">
        <el-select v-model="q.status" placeholder="Trạng thái học" aria-label="Trạng thái học" clearable style="width:200px">
          <el-option value="Studying" label="Đang học" />
          <el-option value="Deferred" label="Bảo lưu" />
          <el-option value="Completed" label="Hoàn thành" />
        </el-select>
        <el-select v-model="q.payment" placeholder="Học phí" aria-label="Học phí" clearable style="width:200px">
          <el-option value="Unpaid" label="Chưa đóng" />
          <el-option value="Partial" label="Đóng một phần" />
          <el-option value="Paid" label="Đã đóng đủ" />
        </el-select>
      </div>`,
  }),
}

export const Multiple: Story = {
  render: () => ({
    setup: () => ({ form: reactive({ days: ['Mon', 'Wed', 'Fri'] }) }),
    template: `
      <el-form label-position="top" class="sb-narrow">
        <el-form-item label="Ngày học trong tuần" for="days">
          <el-select id="days" v-model="form.days" multiple collapse-tags collapse-tags-tooltip>
            <el-option v-for="d in [['Mon','Thứ 2'],['Tue','Thứ 3'],['Wed','Thứ 4'],['Thu','Thứ 5'],['Fri','Thứ 6'],['Sat','Thứ 7'],['Sun','Chủ nhật']]" :key="d[0]" :value="d[0]" :label="d[1]" />
          </el-select>
        </el-form-item>
      </el-form>`,
  }),
}

export const Grouped: Story = {
  render: () => ({
    setup: () => ({ form: reactive({ course: 'ielts-65' }) }),
    template: `
      <el-form label-position="top" class="sb-narrow">
        <el-form-item label="Khóa học" for="course">
          <el-select id="course" v-model="form.course">
            <el-option-group label="Luyện thi">
              <el-option value="ielts-65" label="IELTS Intensive 6.5+" />
              <el-option value="toeic-650" label="TOEIC 650+" />
            </el-option-group>
            <el-option-group label="Giao tiếp">
              <el-option value="gt" label="Giao tiếp cơ bản" />
              <el-option value="kids" label="Tiếng Anh thiếu nhi" />
            </el-option-group>
          </el-select>
        </el-form-item>
      </el-form>`,
  }),
}

export const States: Story = {
  render: () => ({
    template: `
      <el-form label-position="top" class="sb-narrow">
        <el-form-item label="Học viên (đang tải)" for="loading">
          <el-select id="loading" loading placeholder="Chọn" />
        </el-form-item>
        <el-form-item label="Khóa học (không đổi được sau khi mở lớp)" for="disabled">
          <el-select id="disabled" model-value="ielts" disabled>
            <el-option value="ielts" label="IELTS Intensive 6.5+" />
          </el-select>
        </el-form-item>
        <el-form-item label="Lớp" for="err" error="Vui lòng chọn lớp">
          <el-select id="err" placeholder="Chọn" />
        </el-form-item>
      </el-form>`,
  }),
}
