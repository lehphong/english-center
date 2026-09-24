import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ElForm, ElFormItem, ElInput, ElOption, ElSelect } from 'element-plus'

/** Form fields: the label is always visible, borders use `line-strong`, errors use a `danger` border and say how to fix it. */
const meta = {
  title: 'Components/Field',
  tags: ['!autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const States: Story = {
  render: () => ({
    components: { ElForm, ElFormItem, ElInput, ElSelect, ElOption },
    setup: () => ({ form: { code: 'IELTS-2601', phone: '091234', level: 'Intermediate', name: '' } }),
    template: `
      <ElForm label-position="top" style="max-width:420px">
        <ElFormItem label="Mã lớp" required>
          <ElInput id="code" v-model="form.code" />
        </ElFormItem>
        <ElFormItem label="Số điện thoại" required error="Số điện thoại gồm 10 chữ số, bắt đầu bằng 0">
          <ElInput id="phone" v-model="form.phone" />
        </ElFormItem>
        <ElFormItem label="Trình độ đầu vào">
          <ElSelect id="level" v-model="form.level">
            <ElOption value="Beginner" label="Mất gốc" />
            <ElOption value="Intermediate" label="Trung cấp" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="Họ và tên">
          <ElInput id="name" v-model="form.name" placeholder="Nguyễn Văn An" />
        </ElFormItem>
      </ElForm>`,
  }),
}
