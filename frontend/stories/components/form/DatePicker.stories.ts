import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { reactive } from 'vue'

/**
 * `ElDatePicker` / `ElTimePicker`. Values travel as ISO strings (`value-format="YYYY-MM-DD"`); the display format
 * follows the language (`DD/MM/YYYY` in Vietnamese). The calendar's month and weekday names follow the language toolbar.
 */
const meta = {
  title: 'Components/Form/Date picker',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const SingleDate: Story = {
  render: () => ({
    setup: () => ({ form: reactive({ dob: '2004-05-12', session: '2026-09-24' }) }),
    template: `
      <el-form label-position="top" class="sb-narrow">
        <el-form-item label="Ngày sinh" for="dob">
          <el-date-picker id="dob" v-model="form.dob" type="date" value-format="YYYY-MM-DD" format="DD/MM/YYYY" style="width:100%" />
        </el-form-item>
        <el-form-item label="Ngày học (không xóa được)" for="session">
          <el-date-picker id="session" v-model="form.session" type="date" value-format="YYYY-MM-DD" format="DD/MM/YYYY" :clearable="false" style="width:100%" />
        </el-form-item>
      </el-form>`,
  }),
}

/**
 * The calendar panel: today is outlined, the selected day uses the accent.
 * Known Element Plus issue: the panel is a `role="dialog"` without a name, so that axe rule is turned off here.
 */
export const Calendar: Story = {
  ...SingleDate,
  parameters: { a11y: { config: { rules: [{ id: 'aria-dialog-name', enabled: false }] } } },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByLabelText('Ngày học (không xóa được)'))
    await waitFor(() => expect(within(document.body).getByRole('grid')).toBeVisible())
  },
}

/** A class runs from its start date to its end date: pick both in one control. */
export const Range: Story = {
  render: () => ({
    setup: () => ({ form: reactive({ term: ['2026-09-07', '2026-12-18'] }) }),
    template: `
      <el-form label-position="top" style="max-width:480px">
        <el-form-item label="Thời gian học">
          <el-date-picker v-model="form.term" type="daterange" value-format="YYYY-MM-DD" format="DD/MM/YYYY"
            start-placeholder="Ngày khai giảng" end-placeholder="Ngày kết thúc" range-separator="–"
            start-aria-label="Ngày khai giảng" end-aria-label="Ngày kết thúc" style="width:100%" />
        </el-form-item>
      </el-form>`,
  }),
}

export const MonthAndTime: Story = {
  render: () => ({
    setup: () => ({ form: reactive({ month: '2026-09', start: '18:30' }) }),
    template: `
      <el-form label-position="top" class="sb-narrow">
        <el-form-item label="Tháng báo cáo" for="month">
          <el-date-picker id="month" v-model="form.month" type="month" value-format="YYYY-MM" format="MM/YYYY" style="width:100%" />
        </el-form-item>
        <el-form-item label="Giờ bắt đầu" for="start">
          <el-time-select id="start" v-model="form.start" start="07:00" step="00:30" end="21:00" style="width:100%" />
        </el-form-item>
      </el-form>`,
  }),
}
