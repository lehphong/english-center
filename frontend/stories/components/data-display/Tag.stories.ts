import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

/**
 * `ElTag`: short neutral labels such as a grading scheme, a skill or an applied filter.
 * **States** (payment, learning, account) always use `StatusTag`, which adds a shape and a fixed tone.
 * Use the `light` (default) or `plain` effect. The `dark` effect is a large block of saturated color, which breaks
 * the saturation rule.
 */
const meta = {
  title: 'Components/Data display/Tag',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** `info` is neutral in Element Plus; `primary` is the ochre accent for the one label that matters. */
export const Types: Story = {
  render: () => ({
    template: `
      <div class="sb-stack">
        <div class="sb-row">
          <el-tag type="info">Thang 10</el-tag>
          <el-tag type="primary">IELTS</el-tag>
          <el-tag type="success">Đạt</el-tag>
          <el-tag type="warning">Sắp hết chỗ</el-tag>
          <el-tag type="danger">Quá hạn</el-tag>
        </div>
        <div class="sb-row">
          <el-tag type="info" effect="plain">Thang 10</el-tag>
          <el-tag type="primary" effect="plain">IELTS</el-tag>
          <el-tag type="success" effect="plain">Đạt</el-tag>
          <el-tag type="warning" effect="plain">Sắp hết chỗ</el-tag>
          <el-tag type="danger" effect="plain">Quá hạn</el-tag>
        </div>
      </div>`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <el-tag type="info" size="large">Nghe</el-tag>
        <el-tag type="info">Nghe</el-tag>
        <el-tag type="info" size="small">Nghe</el-tag>
        <el-tag type="info" round>Buổi 12</el-tag>
      </div>`,
  }),
}

/** Applied filters as closable tags; closing one removes the filter. */
export const Closable: Story = {
  render: () => ({
    setup() {
      const filters = ref(['Lớp: IELTS-2601', 'Học phí: Còn nợ', 'Trạng thái: Đang học'])
      return { filters, close: (f: string) => (filters.value = filters.value.filter((x) => x !== f)) }
    },
    template: `
      <div class="sb-row">
        <span class="muted">Đang lọc:</span>
        <el-tag v-for="f in filters" :key="f" type="info" closable @close="close(f)">{{ f }}</el-tag>
        <el-button v-if="filters.length" type="primary" link @click="filters = []">Xóa bộ lọc</el-button>
      </div>`,
  }),
}
