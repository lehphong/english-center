import { ArrowRight } from '@element-plus/icons-vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * `ElBreadcrumb`: the way back up from a detail page (Classes › IELTS-2601). The last item is the current page and
 * is not a link. Only use it on pages two or more levels deep.
 */
const meta = {
  title: 'Components/Navigation/Breadcrumb',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    setup: () => ({ ArrowRight }),
    template: `
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item><NuxtLink to="/classes">Lớp học</NuxtLink></el-breadcrumb-item>
        <el-breadcrumb-item><NuxtLink to="/classes/1">IELTS-2601</NuxtLink></el-breadcrumb-item>
        <el-breadcrumb-item aria-current="page">Điểm danh buổi 12</el-breadcrumb-item>
      </el-breadcrumb>`,
  }),
}
