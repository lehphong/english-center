import { Plus } from '@element-plus/icons-vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ElButton } from 'element-plus'
import PageHeader from '~/components/PageHeader.vue'

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  args: { title: 'Quản lý khóa học', subtitle: '' },
  render: (args) => ({
    components: { PageHeader, ElButton },
    setup: () => ({ args, Plus }),
    template: '<PageHeader v-bind="args"><ElButton type="primary" :icon="Plus">Thêm khóa học</ElButton></PageHeader>',
  }),
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const WithAction: Story = {}

export const WithSubtitle: Story = {
  args: { title: 'Nhập điểm theo lớp', subtitle: 'Chọn lớp và kỳ kiểm tra để nhập điểm' },
}
