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

/** The palette by 60 – 30 – 10 role, read from design-system/tokens.json. Switch theme in the toolbar to see the dark values. */
export const Colors: Story = {
  name: 'Colors',
  render: () => ({ components: { ColorPalette }, template: '<ColorPalette />' }),
}

/** Be Vietnam Pro for the interface (clear Vietnamese diacritics at small sizes), IBM Plex Mono for figures. */
export const Typography: Story = {
  name: 'Typography',
  render: () => ({ components: { TypeScale }, template: '<TypeScale />' }),
}

export const SpacingAndShape: Story = {
  name: 'Spacing, radius and shadow',
  render: () => ({ components: { SpaceAndShape }, template: '<SpaceAndShape />' }),
}
