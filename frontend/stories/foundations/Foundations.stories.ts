import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ColorPalette from './ColorPalette.vue'
import SpaceAndShape from './SpaceAndShape.vue'
import TypeScale from './TypeScale.vue'

const meta = {
  title: 'Foundations',
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Bảng màu theo vai trò 60 – 30 – 10, đọc trực tiếp từ design-system/tokens.json. Đổi theme ở thanh công cụ để xem bản tối. */
export const Colors: Story = {
  name: 'Màu',
  render: () => ({ components: { ColorPalette }, template: '<ColorPalette />' }),
}

/** Be Vietnam Pro cho giao diện (dấu tiếng Việt rõ ở cỡ nhỏ), IBM Plex Mono cho số liệu. */
export const Typography: Story = {
  name: 'Chữ',
  render: () => ({ components: { TypeScale }, template: '<TypeScale />' }),
}

export const SpacingAndShape: Story = {
  name: 'Khoảng cách, bo góc, đổ bóng',
  render: () => ({ components: { SpaceAndShape }, template: '<SpaceAndShape />' }),
}
