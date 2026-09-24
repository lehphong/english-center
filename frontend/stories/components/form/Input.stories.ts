import { Lock, Message, Phone, Search, User } from '@element-plus/icons-vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { reactive, ref } from 'vue'

/**
 * `ElInput`: single-line text, password and multi-line text.
 * Every input has a visible label (`ElFormItem`), or an `aria-label` when a filter bar uses its placeholder as the label.
 * Placeholders show an example (*Nguyễn Văn An*), never the instructions; instructions go in the label or the error.
 */
const meta = {
  title: 'Components/Form/Input',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {
  render: () => ({
    setup: () => ({ form: reactive({ name: 'Nguyễn Văn An', email: '', phone: '0912345678' }), Message, Phone }),
    template: `
      <el-form label-position="top" class="sb-narrow">
        <el-form-item label="Họ và tên" for="name"><el-input id="name" v-model="form.name" /></el-form-item>
        <el-form-item label="Email" for="email"><el-input id="email" v-model="form.email" :prefix-icon="Message" placeholder="an.nguyen@example.com" clearable /></el-form-item>
        <el-form-item label="Số điện thoại" for="phone"><el-input id="phone" v-model="form.phone" :prefix-icon="Phone" maxlength="10" show-word-limit /></el-form-item>
      </el-form>`,
  }),
}

/** A search box in a filter bar: the placeholder doubles as the label, so it also gets an `aria-label`. */
export const SearchBox: Story = {
  render: () => ({
    setup: () => ({ q: ref(''), Search }),
    template: `
      <div class="sb-row">
        <el-input v-model="q" :prefix-icon="Search" placeholder="Nhập từ khóa..." aria-label="Nhập từ khóa..." clearable style="width:260px" />
        <el-button type="primary" plain>Tìm kiếm</el-button>
      </div>`,
  }),
}

export const Password: Story = {
  render: () => ({
    setup: () => ({ form: reactive({ username: 'admin', password: 'Passw0rd!' }), User, Lock }),
    template: `
      <el-form label-position="top" size="large" class="sb-narrow">
        <el-form-item label="Tên đăng nhập" for="username"><el-input id="username" v-model="form.username" :prefix-icon="User" /></el-form-item>
        <el-form-item label="Mật khẩu" for="password"><el-input id="password" v-model="form.password" type="password" :prefix-icon="Lock" show-password /></el-form-item>
      </el-form>`,
  }),
}

export const Textarea: Story = {
  render: () => ({
    setup: () => ({ note: ref('Tiến bộ tốt, cần luyện thêm Writing Task 2.') }),
    template: `
      <el-form label-position="top" class="sb-narrow">
        <el-form-item label="Nhận xét" for="note">
          <el-input id="note" v-model="note" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>`,
  }),
}

/** Large on the sign-in page, default in forms, small inside dense tables. */
export const Sizes: Story = {
  render: () => ({
    setup: () => ({ v: ref('IELTS-2601') }),
    template: `
      <div class="sb-stack sb-narrow">
        <el-input v-model="v" size="large" aria-label="Lớn" />
        <el-input v-model="v" aria-label="Mặc định" />
        <el-input v-model="v" size="small" aria-label="Nhỏ" />
      </div>`,
  }),
}

/** Disabled: cannot change now. Read-only: can never change here, but can be selected and copied. */
export const States: Story = {
  render: () => ({
    setup: () => ({ code: ref('HV001'), user: ref('hv001') }),
    template: `
      <el-form label-position="top" class="sb-narrow">
        <el-form-item label="Mã học viên (tự sinh)" for="code"><el-input id="code" v-model="code" readonly /></el-form-item>
        <el-form-item label="Tên đăng nhập" for="user"><el-input id="user" v-model="user" disabled /></el-form-item>
        <el-form-item label="Email" for="bad" error="Email chưa đúng định dạng, ví dụ an.nguyen@example.com">
          <el-input id="bad" model-value="an.nguyen@" />
        </el-form-item>
      </el-form>`,
  }),
}
