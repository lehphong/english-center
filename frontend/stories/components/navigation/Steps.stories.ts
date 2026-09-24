import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * `ElSteps`: where the user is in a multi-step flow (enroll → pay → place in class), or the stages of a course.
 * Finished steps are `success` green with a tick (`finish-status="success"`), the current step is bold `ink`,
 * later steps are muted.
 * A failed step uses `error` and says why in its description.
 */
const meta = {
  title: 'Components/Navigation/Steps',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Flow: Story = {
  render: () => ({
    template: `
      <el-steps :active="1" finish-status="success" style="max-width:720px">
        <el-step title="Thông tin học viên" />
        <el-step title="Chọn lớp" />
        <el-step title="Đóng học phí" />
        <el-step title="Hoàn tất" />
      </el-steps>`,
  }),
}

export const WithDescriptions: Story = {
  render: () => ({
    template: `
      <el-steps :active="2" finish-status="success" style="max-width:720px">
        <el-step title="Kiểm tra đầu vào" description="Band 5.0 · 02/09" />
        <el-step title="Giữa kỳ" description="Band 6.0 · 20/10" />
        <el-step title="Cuối kỳ" description="Dự kiến 15/12" />
      </el-steps>`,
  }),
}

/** A step that failed: the payment could not be recorded. */
export const Failed: Story = {
  render: () => ({
    template: `
      <el-steps :active="2" finish-status="success" process-status="error" style="max-width:720px">
        <el-step title="Thông tin học viên" />
        <el-step title="Chọn lớp" />
        <el-step title="Đóng học phí" description="Lớp đã đủ, vui lòng chọn lớp khác" />
      </el-steps>`,
  }),
}

export const Vertical: Story = {
  render: () => ({
    template: `
      <div style="height:260px">
        <el-steps direction="vertical" :active="1" finish-status="success">
          <el-step title="Ghi danh" description="01/09/2026" />
          <el-step title="Đang học" description="Buổi 12/36" />
          <el-step title="Hoàn thành" />
        </el-steps>
      </div>`,
  }),
}
