import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { reactive } from 'vue'

/**
 * `ElSlider`: choose a value or range where the rough position matters more than the exact number,
 * like filtering by score band. When the exact value matters, pair it with an input (`show-input`).
 */
const meta = {
  title: 'Components/Form/Slider',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  render: () => ({
    setup: () => ({ s: reactive({ target: 6.5 }) }),
    template: `
      <el-form label-position="top" class="sb-narrow">
        <el-form-item label="Band mục tiêu">
          <el-slider v-model="s.target" :min="4" :max="9" :step="0.5" show-stops aria-label="Band mục tiêu" />
        </el-form-item>
      </el-form>`,
  }),
}

/** A range filter: overall band from … to … */
export const Range: Story = {
  render: () => ({
    setup: () => ({ s: reactive({ band: [5.5, 7] }) }),
    template: `
      <el-form label-position="top" class="sb-narrow">
        <el-form-item label="Lọc theo band tổng">
          <el-slider v-model="s.band" range :min="0" :max="9" :step="0.5" range-start-label="Band từ" range-end-label="Band đến" />
        </el-form-item>
      </el-form>`,
  }),
}

/**
 * Slider plus an exact number. Pair it with a labelled `ElInputNumber` instead of `show-input`:
 * Element Plus renders that input without an accessible name.
 */
export const WithInput: Story = {
  render: () => ({
    setup: () => ({ s: reactive({ rate: 80 }) }),
    template: `
      <el-form label-position="top" style="max-width:520px">
        <el-form-item label="Tỉ lệ chuyên cần tối thiểu (%)">
          <div class="sb-row" style="width:100%;flex-wrap:nowrap">
            <el-slider v-model="s.rate" :min="0" :max="100" :step="5" aria-label="Tỉ lệ chuyên cần tối thiểu" style="flex:1" />
            <el-input-number v-model="s.rate" :min="0" :max="100" :step="5" controls-position="right" aria-label="Tỉ lệ chuyên cần tối thiểu (%)" style="width:110px" />
          </div>
        </el-form-item>
      </el-form>`,
  }),
}
