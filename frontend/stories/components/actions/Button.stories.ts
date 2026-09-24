import { ArrowDown, Delete, Download, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ElButton } from 'element-plus'

/**
 * `ElButton`, themed in `app/assets/css/element-plus.css`.
 *
 * - **Primary** (ochre fill, dark `on-ochre` text): the one main action of a region: *Save*, *Add course*. At most one per region.
 * - **Default**: secondary actions, including *Cancel*.
 * - **Plain primary**: a secondary action that should still stand out, like *Search* next to the filters.
 * - **Link**: row actions inside tables (*Edit*, *Delete*); `danger` only for destructive ones.
 * - **Danger** (filled): only the confirm button of a destructive dialog.
 */
const meta = {
  title: 'Components/Actions/Button',
  component: ElButton,
  argTypes: {
    type: { control: 'select', options: ['primary', 'default', 'danger'] },
    plain: { control: 'boolean' },
    link: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: { control: 'select', options: ['large', 'default', 'small'] },
  },
  args: { type: 'primary' },
  render: (args) => ({ components: { ElButton }, setup: () => ({ args }), template: '<ElButton v-bind="args">Lưu</ElButton>' }),
} satisfies Meta<typeof ElButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** From strongest to weakest. A region shows one primary action; everything else steps down. */
export const Hierarchy: Story = {
  render: () => ({
    setup: () => ({ Plus, Search }),
    template: `
      <div class="sb-row">
        <el-button type="primary" :icon="Plus">Thêm khóa học</el-button>
        <el-button type="primary" plain :icon="Search">Tìm kiếm</el-button>
        <el-button>Hủy</el-button>
        <el-button type="primary" link>Sửa</el-button>
        <el-button type="danger" link>Xóa</el-button>
      </div>`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <el-button type="primary" size="large">Đăng nhập</el-button>
        <el-button type="primary">Lưu</el-button>
        <el-button type="primary" size="small">Lưu điểm</el-button>
      </div>`,
  }),
}

/** Icon-only buttons must carry an `aria-label` (and a tooltip when the icon is not obvious). */
export const WithIcons: Story = {
  render: () => ({
    setup: () => ({ Plus, Download, Edit, Delete, Refresh }),
    template: `
      <div class="sb-row">
        <el-button type="primary" :icon="Plus">Ghi danh</el-button>
        <el-button :icon="Download">Xuất Excel</el-button>
        <el-button :icon="Refresh" circle aria-label="Tải lại" />
        <el-button :icon="Edit" circle aria-label="Sửa" />
        <el-button type="danger" :icon="Delete" circle plain aria-label="Xóa" />
      </div>`,
  }),
}

/** While saving, the button shows a spinner and ignores clicks; disabled buttons fade but keep their shape. */
export const States: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <el-button type="primary" loading>Đang lưu</el-button>
        <el-button type="primary" disabled>Lưu</el-button>
        <el-button disabled>Hủy</el-button>
        <el-button type="primary" link disabled>Sửa</el-button>
      </div>`,
  }),
}

/** The confirm button of a destructive dialog: the only place a filled danger button appears. */
export const Destructive: Story = {
  render: () => ({
    setup: () => ({ Delete }),
    template: `
      <div class="sb-row">
        <el-button>Hủy</el-button>
        <el-button type="danger" :icon="Delete">Xác nhận xóa</el-button>
      </div>`,
  }),
}

/** Related actions that switch a view or step through data. */
export const Group: Story = {
  render: () => ({
    setup: () => ({ ArrowDown }),
    template: `
      <div class="sb-row">
        <el-button-group>
          <el-button>Buổi trước</el-button>
          <el-button>Buổi sau</el-button>
        </el-button-group>
        <el-button-group>
          <el-button type="primary">Lưu</el-button>
          <el-button type="primary" :icon="ArrowDown" aria-label="Thêm tùy chọn lưu" />
        </el-button-group>
      </div>`,
  }),
}
