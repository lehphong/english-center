import { InfoFilled, Refresh } from '@element-plus/icons-vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * `ElTooltip`: names an icon-only button or explains a term, in a few words. Never put anything essential only in a
 * tooltip: it doesn't exist on touch screens. The dark effect (`ink` on `surface`, inverted) is the default.
 * The trigger must be focusable, so keyboard users see the tooltip too.
 */
const meta = {
  title: 'Components/Feedback/Tooltip',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Shown open, rendered in place, so both themes can be checked. */
export const Open: Story = {
  render: () => ({
    setup: () => ({ Refresh, InfoFilled }),
    template: `
      <div class="sb-row" style="gap:120px;padding:48px 16px 16px">
        <el-tooltip content="Tải lại danh sách" :visible="true" :teleported="false" placement="top">
          <el-button :icon="Refresh" circle aria-label="Tải lại danh sách" />
        </el-tooltip>
        <el-tooltip content="Band tổng làm tròn đến 0.5 gần nhất" :visible="true" :teleported="false" effect="light" placement="top">
          <el-button link :icon="InfoFilled" aria-label="Cách tính band tổng" />
        </el-tooltip>
      </div>`,
  }),
}

export const Placements: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <el-tooltip v-for="p in ['top', 'right', 'bottom', 'left']" :key="p" :content="'Hiện ở ' + p" :placement="p">
          <el-button>{{ p }}</el-button>
        </el-tooltip>
      </div>`,
  }),
}
