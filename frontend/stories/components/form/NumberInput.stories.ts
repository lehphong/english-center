import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { reactive } from 'vue'

/**
 * `ElInputNumber`: quantities, money and scores. Use `controls-position="right"` in forms so the value stays
 * left-aligned with other fields; set `min` / `max` / `step` / `precision` so invalid values cannot be typed.
 * Money is shown with thousands separators wherever it is displayed (`useFormat().money`), but typed as a plain number.
 */
const meta = {
  title: 'Components/Form/Number input',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const InForm: Story = {
  render: () => ({
    setup: () => ({ form: reactive({ fee: 8500000, sessions: 36, capacity: 15 }) }),
    template: `
      <el-form label-position="top" class="sb-narrow">
        <el-form-item label="Học phí (đ)" for="fee">
          <el-input-number id="fee" v-model="form.fee" :min="0" :step="100000" controls-position="right" style="width:100%" />
        </el-form-item>
        <el-form-item label="Tổng số buổi" for="sessions">
          <el-input-number id="sessions" v-model="form.sessions" :min="1" :max="200" controls-position="right" style="width:100%" />
        </el-form-item>
        <el-form-item label="Sĩ số tối đa" for="capacity">
          <el-input-number id="capacity" v-model="form.capacity" :min="1" :max="100" disabled controls-position="right" style="width:100%" />
        </el-form-item>
      </el-form>`,
  }),
}

/** IELTS bands step by 0.5 between 0 and 9; the 10-point scale steps by 0.25. Empty means "not graded yet". */
export const Scores: Story = {
  render: () => ({
    setup: () => ({ s: reactive({ ielts: 6.5, ten: 8.25, empty: undefined }) }),
    template: `
      <div class="sb-row">
        <el-input-number v-model="s.ielts" :min="0" :max="9" :step="0.5" :precision="1" :controls="false" aria-label="Band IELTS" style="width:96px" />
        <el-input-number v-model="s.ten" :min="0" :max="10" :step="0.25" :precision="2" :controls="false" aria-label="Điểm hệ 10" style="width:96px" />
        <el-input-number v-model="s.empty" :min="0" :max="9" :step="0.5" :controls="false" aria-label="Chưa nhập điểm" style="width:96px" />
      </div>`,
  }),
}

/** A stepper with a prefix label, as in the attendance toolbar (session number). */
export const Stepper: Story = {
  render: () => ({
    setup: () => ({ s: reactive({ session: 12 }) }),
    template: `
      <el-input-number v-model="s.session" :min="1" :max="36" aria-label="Buổi">
        <template #prefix>Buổi</template>
      </el-input-number>`,
  }),
}
