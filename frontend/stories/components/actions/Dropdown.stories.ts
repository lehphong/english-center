import { ArrowDown, Delete, Download, Key, Lock, SwitchButton } from '@element-plus/icons-vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

/**
 * `ElDropdown`: groups secondary actions that don't deserve their own button, like the user menu or
 * *More* on a table row. Destructive items go last, after a divider, in `danger`.
 */
const meta = {
  title: 'Components/Actions/Dropdown',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const menu = `
  <template #dropdown>
    <el-dropdown-menu>
      <el-dropdown-item :icon="Download">Xuất danh sách</el-dropdown-item>
      <el-dropdown-item :icon="Key">Đặt lại mật khẩu</el-dropdown-item>
      <el-dropdown-item :icon="Lock" disabled>Khóa tài khoản</el-dropdown-item>
      <el-dropdown-item :icon="Delete" divided class="is-danger">Xóa học viên</el-dropdown-item>
    </el-dropdown-menu>
  </template>`

const icons = { ArrowDown, Delete, Download, Key, Lock, SwitchButton }

/** Opens on click and is fully keyboard operable (Enter / Space, arrows, Esc). */
export const Menu: Story = {
  render: () => ({
    components: { ArrowDown },
    setup: () => icons,
    template: `
      <el-dropdown trigger="click">
        <el-button>Thao tác khác <el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
        ${menu}
      </el-dropdown>`,
  }),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Thao tác khác/ }))
    await waitFor(() => expect(within(document.body).getByRole('menuitem', { name: 'Xóa học viên' })).toBeVisible())
  },
}

/** A main action with related alternatives: the left part runs the default action. */
export const SplitButton: Story = {
  render: () => ({
    setup: () => icons,
    template: `
      <el-dropdown split-button type="primary" trigger="click">
        Lưu
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>Lưu và thêm mới</el-dropdown-item>
            <el-dropdown-item>Lưu và đóng</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>`,
  }),
}
