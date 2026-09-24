import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, reactive, ref } from 'vue'

/**
 * `ElCheckbox`: independent yes/no choices, or picking several items from a short list.
 * Checked boxes use `ochre-ink` with a `surface` tick, so the tick stays readable in both themes.
 * For a setting that takes effect immediately, use a switch instead.
 */
const meta = {
  title: 'Components/Form/Checkbox',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  render: () => ({
    setup: () => ({ s: reactive({ account: true, notify: false }) }),
    template: `
      <div class="sb-stack">
        <el-checkbox v-model="s.account">Tạo tài khoản đăng nhập cho học viên</el-checkbox>
        <el-checkbox v-model="s.notify">Gửi email thông báo lịch học</el-checkbox>
        <el-checkbox :model-value="true" disabled>Đã xác nhận thông tin (khóa)</el-checkbox>
        <el-checkbox :model-value="false" disabled>Không áp dụng</el-checkbox>
      </div>`,
  }),
}

/**
 * "Select all" shows the indeterminate state while only some items are checked.
 * Known Element Plus issue: it puts `aria-checked="mixed"` on the `<label>` instead of the input, so that axe rule
 * is turned off for this story.
 */
export const Group: Story = {
  parameters: { a11y: { config: { rules: [{ id: 'aria-allowed-attr', enabled: false }] } } },
  render: () => ({
    setup() {
      const skills = ['Nghe', 'Đọc', 'Viết', 'Nói']
      const picked = ref(['Nghe', 'Đọc'])
      const all = computed({
        get: () => picked.value.length === skills.length,
        set: (v: boolean) => (picked.value = v ? [...skills] : []),
      })
      const partial = computed(() => picked.value.length > 0 && picked.value.length < skills.length)
      return { skills, picked, all, partial }
    },
    template: `
      <fieldset style="border:0;margin:0;padding:0">
        <legend class="sb-label">Kỹ năng cần kiểm tra</legend>
        <el-checkbox v-model="all" :indeterminate="partial">Tất cả kỹ năng</el-checkbox>
        <el-checkbox-group v-model="picked">
          <el-checkbox v-for="s in skills" :key="s" :value="s">{{ s }}</el-checkbox>
        </el-checkbox-group>
      </fieldset>`,
  }),
}

/** Bordered checkboxes read as cards: use them for a few rich options. */
export const Bordered: Story = {
  render: () => ({
    setup: () => ({ picked: ref(['morning']) }),
    template: `
      <el-checkbox-group v-model="picked" aria-label="Ca học có thể tham gia">
        <el-checkbox value="morning" border>Ca sáng</el-checkbox>
        <el-checkbox value="evening" border>Ca tối</el-checkbox>
        <el-checkbox value="weekend" border disabled>Cuối tuần (hết chỗ)</el-checkbox>
      </el-checkbox-group>`,
  }),
}
