import type { Meta, StoryObj } from '@storybook/vue3-vite'
import StatusTag from '~/components/StatusTag.vue'

/**
 * `ElDescriptions`: read-only details of one record (a student profile, a class). Labels are `ink-muted` on a
 * sunken cell; values are `ink`. Numbers and codes use the mono face with tabular figures (`.num`).
 */
const meta = {
  title: 'Components/Data display/Descriptions',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The bordered form on detail pages. */
export const Bordered: Story = {
  render: () => ({
    components: { StatusTag },
    template: `
      <el-descriptions :column="2" border style="max-width:720px">
        <el-descriptions-item label="Mã học viên"><span class="num">HV001</span></el-descriptions-item>
        <el-descriptions-item label="Họ và tên">Nguyễn Văn An</el-descriptions-item>
        <el-descriptions-item label="Email">an.nguyen@example.com</el-descriptions-item>
        <el-descriptions-item label="Số điện thoại"><span class="num">0912 345 678</span></el-descriptions-item>
        <el-descriptions-item label="Trình độ đầu vào"><el-tag type="info">Trung cấp</el-tag></el-descriptions-item>
        <el-descriptions-item label="Tài khoản"><StatusTag tone="success" label="Đã có tài khoản" /></el-descriptions-item>
        <el-descriptions-item label="Địa chỉ" :span="2">12 Nguyễn Trãi, Thanh Xuân, Hà Nội</el-descriptions-item>
      </el-descriptions>`,
  }),
}

/** The compact form inside cards. */
export const Plain: Story = {
  render: () => ({
    template: `
      <el-descriptions title="Học phí" :column="1" style="max-width:360px">
        <el-descriptions-item label="Học phí"><span class="num">8.500.000 ₫</span></el-descriptions-item>
        <el-descriptions-item label="Đã đóng"><span class="num">5.000.000 ₫</span></el-descriptions-item>
        <el-descriptions-item label="Còn nợ"><span class="num">3.500.000 ₫</span></el-descriptions-item>
      </el-descriptions>`,
  }),
}
