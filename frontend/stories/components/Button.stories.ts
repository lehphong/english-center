import { Delete, Plus } from '@element-plus/icons-vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ElButton } from 'element-plus'

/**
 * Nút dùng `ElButton` của Element Plus, đã được theme theo Hoàng Thổ trong `app/assets/css/element-plus.css`.
 * Mỗi vùng màn hình chỉ một nút `primary`.
 */
const meta = {
  title: 'Components/Button',
  component: ElButton,
  argTypes: {
    type: { control: 'select', options: ['primary', 'default', 'danger'] },
    plain: { control: 'boolean' },
    link: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: { control: 'select', options: ['large', 'default', 'small'] },
  },
  args: { type: 'primary' },
  render: (args) => ({ components: { ElButton }, setup: () => ({ args }), template: '<ElButton v-bind="args">Lưu</ElButton>' }),
} satisfies Meta<typeof ElButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  render: () => ({
    components: { ElButton },
    setup: () => ({ Plus, Delete }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
          <ElButton type="primary" :icon="Plus">Thêm khóa học</ElButton>
          <ElButton>Hủy</ElButton>
          <ElButton type="primary" plain>Tìm kiếm</ElButton>
          <ElButton type="primary" link>Sửa</ElButton>
          <ElButton type="danger" link>Xóa</ElButton>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
          <ElButton type="danger" :icon="Delete">Xác nhận xóa</ElButton>
          <ElButton type="primary" disabled>Lưu (đang khóa)</ElButton>
          <ElButton type="primary" size="small">Lưu điểm</ElButton>
        </div>
      </div>`,
  }),
}
