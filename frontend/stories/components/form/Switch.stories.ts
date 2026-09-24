import { Moon, Sunny } from '@element-plus/icons-vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { reactive } from 'vue'

/**
 * `ElSwitch`: an on/off setting that applies right away (active course, locked account).
 * Every switch needs a visible label next to it or an `aria-label`. Use `loading` while the change is saved,
 * and a checkbox instead inside forms that are only saved when the user presses *Save*.
 */
const meta = {
  title: 'Components/Form/Switch',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    setup: () => ({ s: reactive({ active: true, locked: false }) }),
    template: `
      <el-form label-position="left" label-width="200px" class="sb-narrow">
        <el-form-item label="Đang mở ghi danh"><el-switch v-model="s.active" aria-label="Đang mở ghi danh" /></el-form-item>
        <el-form-item label="Khóa tài khoản"><el-switch v-model="s.locked" aria-label="Khóa tài khoản" /></el-form-item>
      </el-form>`,
  }),
}

/** Text next to the switch says what each position means; it is not a label, so the switch still needs `aria-label`. */
export const WithText: Story = {
  render: () => ({
    setup: () => ({ s: reactive({ active: true, dark: false }), Moon, Sunny }),
    template: `
      <div class="sb-stack">
        <el-switch v-model="s.active" active-text="Đang hoạt động" inactive-text="Ngừng hoạt động" aria-label="Trạng thái khóa học" />
        <el-switch v-model="s.dark" :active-action-icon="Moon" :inactive-action-icon="Sunny" aria-label="Giao diện tối" />
      </div>`,
  }),
}

export const States: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <el-switch :model-value="true" loading aria-label="Đang lưu" />
        <el-switch :model-value="true" disabled aria-label="Bật (khóa)" />
        <el-switch :model-value="false" disabled aria-label="Tắt (khóa)" />
        <el-switch :model-value="true" size="small" aria-label="Nhỏ" />
        <el-switch :model-value="true" size="large" aria-label="Lớn" />
      </div>`,
  }),
}
