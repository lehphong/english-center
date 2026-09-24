import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * Loading states, from smallest to largest:
 * - a **button** with `loading` while its own request runs (save, sign in);
 * - `v-loading` on the **region** being reloaded (a table, a card): a light `surface` mask keeps the old content visible;
 * - a **skeleton** for a first load (see **Data display › Skeleton**).
 * Never block the whole screen for a request that only affects one region.
 */
const meta = {
  title: 'Components/Feedback/Loading',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Region: Story = {
  render: () => ({
    template: `
      <el-card shadow="never" v-loading="true" element-loading-text="Đang tải điểm danh..." style="max-width:520px">
        <p style="margin:0">IELTS-2601 · Buổi 12 · 24/09/2026</p>
        <p class="muted" style="margin-bottom:0">12 học viên, 11 có mặt</p>
      </el-card>`,
  }),
}

export const Button: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <el-button type="primary" loading>Đang lưu</el-button>
        <el-button loading>Đang tải</el-button>
      </div>`,
  }),
}
