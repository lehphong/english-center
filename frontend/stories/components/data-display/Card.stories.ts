import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * `ElCard`: groups one topic on the `ground` page (60% neutral). Cards are flat (`shadow="never"`) with a
 * hairline border; a shadow is kept for `StatCard` and floating layers only, so it keeps meaning "this stands out".
 */
const meta = {
  title: 'Components/Data display/Card',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => ({
    template: `
      <el-card shadow="never" class="sb-narrow">
        <p style="margin:0">Học viên có thể bảo lưu tối đa 2 lần trong một khóa, mỗi lần không quá 3 tháng.</p>
      </el-card>`,
  }),
}

/** A header names the card and can hold one action; a footer holds secondary information. */
export const HeaderAndFooter: Story = {
  render: () => ({
    template: `
      <el-card shadow="never" style="max-width:520px">
        <template #header>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div><strong>IELTS-2601 · IELTS tối 2-4-6</strong><div class="muted" style="font-size:12px">Phòng 302 · 18:30–20:30</div></div>
            <el-button type="primary" link>Xem lớp</el-button>
          </div>
        </template>
        <el-descriptions :column="2">
          <el-descriptions-item label="Giáo viên">Ms. Linh</el-descriptions-item>
          <el-descriptions-item label="Sĩ số"><span class="num">12/15</span></el-descriptions-item>
          <el-descriptions-item label="Khai giảng">07/09/2026</el-descriptions-item>
          <el-descriptions-item label="Kết thúc">18/12/2026</el-descriptions-item>
        </el-descriptions>
        <template #footer><span class="muted" style="font-size:12px">Cập nhật lần cuối 24/09/2026</span></template>
      </el-card>`,
  }),
}

/** A grid of cards for browsing (the student portal). Hover lift signals the whole card is clickable. */
export const Grid: Story = {
  render: () => ({
    template: `
      <div class="sb-grid">
        <el-card v-for="c in [['IELTS Intensive 6.5+','36 buổi'],['TOEIC 650+','24 buổi'],['Giao tiếp cơ bản','20 buổi']]" :key="c[0]" shadow="hover">
          <strong>{{ c[0] }}</strong>
          <div class="muted">{{ c[1] }}</div>
        </el-card>
      </div>`,
  }),
}
