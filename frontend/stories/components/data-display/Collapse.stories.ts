import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

/**
 * `ElCollapse`: long secondary content that most people skip (rules, FAQ, advanced filters).
 * Don't hide anything needed to finish the task behind a collapse. `accordion` keeps one panel open at a time.
 */
const meta = {
  title: 'Components/Data display/Collapse',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Accordion: Story = {
  render: () => ({
    setup: () => ({ open: ref('defer') }),
    template: `
      <el-collapse v-model="open" accordion style="max-width:640px">
        <el-collapse-item title="Bảo lưu khóa học như thế nào?" name="defer">
          Học viên gửi đơn cho giáo vụ trước buổi học kế tiếp. Mỗi khóa được bảo lưu tối đa 2 lần, mỗi lần không quá 3 tháng.
        </el-collapse-item>
        <el-collapse-item title="Vắng mặt bao nhiêu buổi thì không được thi cuối kỳ?" name="absence">
          Tỉ lệ chuyên cần dưới 80% thì không đủ điều kiện dự kiểm tra cuối kỳ.
        </el-collapse-item>
        <el-collapse-item title="Học phí có được hoàn lại không?" name="refund">
          Hoàn 70% học phí nếu rút trước buổi thứ 3; sau đó không hoàn phí.
        </el-collapse-item>
      </el-collapse>`,
  }),
}
