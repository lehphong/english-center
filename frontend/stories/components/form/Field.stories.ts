import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ElForm, ElFormItem, ElInput, ElOption, ElSelect } from 'element-plus'

/** Form fields: the label is always visible, borders use `line-strong`, errors use a `danger` border and say how to fix it. */
const meta = {
  title: 'Components/Form/Field',
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

/**
 * Dialog forms use a two-column grid (`.form-grid`) that collapses to one column on small screens;
 * long fields (address, notes) span both columns with `.full`. Required fields show an asterisk.
 * Actions sit bottom-right: *Cancel* then the primary *Save*.
 */
export const Layout: Story = {
  render: () => ({
    components: { ElForm, ElFormItem, ElInput, ElSelect, ElOption },
    setup: () => ({ form: { code: 'HV007', name: 'Trần Thị Bích', email: 'bich.tran@example.com', phone: '0987654321', level: 'Elementary', address: '' } }),
    template: `
      <ElForm label-position="top" style="max-width:640px">
        <div class="form-grid">
          <ElFormItem label="Mã học viên" required><ElInput v-model="form.code" aria-label="Mã học viên" /></ElFormItem>
          <ElFormItem label="Họ và tên" required><ElInput v-model="form.name" aria-label="Họ và tên" /></ElFormItem>
          <ElFormItem label="Email"><ElInput v-model="form.email" aria-label="Email" /></ElFormItem>
          <ElFormItem label="Số điện thoại" required><ElInput v-model="form.phone" aria-label="Số điện thoại" /></ElFormItem>
          <ElFormItem label="Trình độ đầu vào">
            <ElSelect v-model="form.level" aria-label="Trình độ đầu vào">
              <ElOption value="Beginner" label="Mất gốc" />
              <ElOption value="Elementary" label="Sơ cấp" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Địa chỉ" class="full"><ElInput v-model="form.address" type="textarea" :rows="2" aria-label="Địa chỉ" /></ElFormItem>
        </div>
        <div class="sb-row" style="justify-content:flex-end">
          <el-button>Hủy</el-button>
          <el-button type="primary">Lưu</el-button>
        </div>
      </ElForm>`,
  }),
}
