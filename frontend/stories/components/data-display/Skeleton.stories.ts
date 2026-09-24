import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * `ElSkeleton`: the first load of a page region whose shape is known (cards, a profile). It keeps the layout from
 * jumping. For reloading data that is already on screen, use `v-loading` on the region instead.
 */
const meta = {
  title: 'Components/Data display/Skeleton',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Card: Story = {
  render: () => ({
    template: `
      <div class="sb-grid">
        <el-card v-for="i in 3" :key="i" shadow="never">
          <el-skeleton :rows="3" animated />
        </el-card>
      </div>`,
  }),
}

export const Profile: Story = {
  render: () => ({
    template: `
      <el-card shadow="never" style="max-width:520px">
        <el-skeleton animated>
          <template #template>
            <div class="sb-row">
              <el-skeleton-item variant="circle" style="width:64px;height:64px" />
              <div style="flex:1">
                <el-skeleton-item variant="h3" style="width:50%" />
                <el-skeleton-item variant="text" style="width:30%;margin-top:8px" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </el-card>`,
  }),
}
