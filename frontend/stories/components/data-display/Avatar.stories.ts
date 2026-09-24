import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * `ElAvatar`: a person's photo, or their initial when there is none (`fullName.charAt(0)`).
 * 28px in the header, 36px in tables, 96px on a profile. Photos are decorative next to the name, so no alt text is
 * needed there; a photo shown alone needs `alt` with the person's name.
 */
const meta = {
  title: 'Components/Data display/Avatar',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const photo =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='%23d4952b'/><circle cx='32' cy='26' r='12' fill='%233b2a1d'/><rect x='14' y='42' width='36' height='22' rx='11' fill='%233b2a1d'/></svg>"

export const Sizes: Story = {
  render: () => ({
    setup: () => ({ photo }),
    template: `
      <div class="sb-row">
        <el-avatar :size="28">A</el-avatar>
        <el-avatar :size="36">B</el-avatar>
        <el-avatar :size="56">C</el-avatar>
        <el-avatar :size="96" :src="photo" alt="Nguyễn Văn An" />
      </div>`,
  }),
}

/** Square avatars are for things (a course thumbnail); round ones are for people. */
export const Shapes: Story = {
  render: () => ({
    setup: () => ({ photo }),
    template: `
      <div class="sb-row">
        <el-avatar :size="48" :src="photo" alt="Nguyễn Văn An" />
        <el-avatar :size="48" shape="square">IE</el-avatar>
      </div>`,
  }),
}

/** A person next to their name, as in tables and the user menu. */
export const WithName: Story = {
  render: () => ({
    template: `
      <div class="sb-stack">
        <div class="sb-row" v-for="p in [['Nguyễn Văn An','HV001'],['Trần Thị Bích','HV002'],['Lê Minh Châu','HV003']]" :key="p[1]">
          <el-avatar :size="36">{{ p[0].charAt(0) }}</el-avatar>
          <div><strong>{{ p[0] }}</strong><div class="muted" style="font-size:12px">{{ p[1] }}</div></div>
        </div>
      </div>`,
  }),
}
