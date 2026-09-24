import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * `ElProgress`: how full a class is, how much of the course has been attended. The bar is ochre;
 * it turns `warning` below a threshold (attendance under 80%) and `danger` (`exception`) when a limit is reached.
 * Every bar needs an `aria-label`, and the number is always shown next to it.
 */
const meta = {
  title: 'Components/Data display/Progress',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Line: Story = {
  render: () => ({
    template: `
      <div class="sb-stack" style="max-width:420px">
        <el-progress :percentage="60" :format="() => '9/15'" :stroke-width="6" aria-label="Sĩ số IELTS-2601" />
        <el-progress :percentage="92" status="success" aria-label="Chuyên cần của An" />
        <el-progress :percentage="71" status="warning" aria-label="Chuyên cần của Dung" />
        <el-progress :percentage="100" status="exception" :format="() => '15/15'" :stroke-width="6" aria-label="Sĩ số GT-2601 (đã đủ)" />
      </div>`,
  }),
}

/** Text inside the bar for wider layouts. */
export const Inside: Story = {
  render: () => ({
    template: `
      <div class="sb-stack" style="max-width:420px">
        <el-progress :percentage="45" :text-inside="true" :stroke-width="20" aria-label="Tiến độ khóa học" />
      </div>`,
  }),
}

/** Circles for a single headline figure (the student's overall attendance). */
export const Circle: Story = {
  render: () => ({
    template: `
      <div class="sb-row" style="gap:32px">
        <el-progress type="circle" :percentage="92" status="success" aria-label="Chuyên cần" />
        <el-progress type="dashboard" :percentage="65" :format="(p) => (p / 100 * 9).toFixed(1)" aria-label="Band hiện tại so với 9.0" />
      </div>`,
  }),
}
