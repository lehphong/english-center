import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ImageUploadButton from '~/components/ImageUploadButton.vue'

/** Chọn ảnh JPG / PNG / WEBP ≤ 2MB; kiểm tra ngay ở trình duyệt, backend kiểm tra lại. */
const meta = {
  title: 'Components/ImageUploadButton',
  component: ImageUploadButton,
  args: { loading: false, hideHint: false },
} satisfies Meta<typeof ImageUploadButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Uploading: Story = { args: { loading: true } }
