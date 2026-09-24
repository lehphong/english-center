import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ImageUploadButton from '~/components/ImageUploadButton.vue'

/** Picks a JPG / PNG / WEBP image up to 2MB; checked in the browser and again by the API. */
const meta = {
  title: 'Components/ImageUploadButton',
  component: ImageUploadButton,
  args: { loading: false, hideHint: false },
} satisfies Meta<typeof ImageUploadButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Uploading: Story = { args: { loading: true } }
