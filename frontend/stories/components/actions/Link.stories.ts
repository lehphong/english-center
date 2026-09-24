import { Document, TopRight } from '@element-plus/icons-vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * Text links. Inside the app, navigation uses `NuxtLink` (a real `<a>`, so it opens in a new tab);
 * `ElLink` is for inline actions and external resources. A disabled `ElLink` needs `aria-disabled="true"`
 * (Element Plus only removes the `href`).
 * Link text is `ochre-ink` (4.5:1 on every surface). Never plain `ochre`, which only reaches 2.5:1 as text.
 */
const meta = {
  title: 'Components/Actions/Link',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Types: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <el-link href="#">Mặc định</el-link>
        <el-link type="primary" href="#">Xem chi tiết lớp</el-link>
        <el-link type="danger" href="#">Hủy ghi danh</el-link>
        <el-link type="primary" disabled aria-disabled="true">Đang khóa</el-link>
      </div>`,
  }),
}

/** Underline on hover by default; always underline links that sit inside running text. */
export const InText: Story = {
  render: () => ({
    template: `
      <p class="sb-narrow" style="margin:0">
        Học viên <NuxtLink to="/students/1">Nguyễn Văn An</NuxtLink> còn nợ học phí lớp
        <el-link type="primary" underline="always" href="#">IELTS-2601</el-link>.
      </p>`,
  }),
}

export const WithIcon: Story = {
  render: () => ({
    components: { TopRight },
    setup: () => ({ Document }),
    template: `
      <div class="sb-row">
        <el-link type="primary" :icon="Document" href="#">Quy chế học vụ</el-link>
        <el-link type="primary" href="https://www.ielts.org" target="_blank">
          Trang IELTS chính thức <el-icon class="el-icon--right"><TopRight /></el-icon>
        </el-link>
      </div>`,
  }),
}
