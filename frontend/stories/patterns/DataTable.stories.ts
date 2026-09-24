import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ElButton, ElTable, ElTableColumn } from 'element-plus'
import StatusTag from '~/components/StatusTag.vue'

const rows = [
  { student: 'Nguyễn Văn An', code: 'HV001', classCode: 'IELTS-2601', course: 'IELTS Intensive 6.5+', fee: '8.500.000 ₫', balance: '0 ₫', payment: 'Paid', learning: 'Studying' },
  { student: 'Trần Thị Bình', code: 'HV002', classCode: 'TOEIC-2601', course: 'TOEIC 650+', fee: '5.000.000 ₫', balance: '3.000.000 ₫', payment: 'Partial', learning: 'Studying' },
  { student: 'Lê Hoàng Cường', code: 'HV003', classCode: 'GT-2601', course: 'Giao tiếp cơ bản', fee: '3.500.000 ₫', balance: '3.500.000 ₫', payment: 'Unpaid', learning: 'Deferred' },
]

/**
 * Bảng danh sách: phẳng trên `surface`, header lõm kiểu nhãn, số tiền mono căn phải và không tô màu —
 * trạng thái nằm ở cột StatusTag riêng.
 */
const meta = {
  title: 'Patterns/DataTable',
  tags: ['!autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Enrollments: Story = {
  render: () => ({
    components: { ElTable, ElTableColumn, ElButton, StatusTag },
    setup: () => ({ rows }),
    template: `
      <ElTable :data="rows">
        <ElTableColumn label="Học viên" min-width="180">
          <template #default="{ row }"><strong>{{ row.student }}</strong><div class="code">{{ row.code }}</div></template>
        </ElTableColumn>
        <ElTableColumn label="Lớp" min-width="180">
          <template #default="{ row }"><a href="#">{{ row.classCode }}</a><div class="muted">{{ row.course }}</div></template>
        </ElTableColumn>
        <ElTableColumn label="Học phí" width="140" align="right">
          <template #default="{ row }"><span class="num">{{ row.fee }}</span></template>
        </ElTableColumn>
        <ElTableColumn label="Còn nợ" width="140" align="right">
          <template #default="{ row }"><span class="num">{{ row.balance }}</span></template>
        </ElTableColumn>
        <ElTableColumn label="Tình trạng học phí" width="190">
          <template #default="{ row }"><StatusTag group="paymentStatus" :value="row.payment" /></template>
        </ElTableColumn>
        <ElTableColumn label="Tình trạng học" width="150">
          <template #default="{ row }"><StatusTag group="learningStatus" :value="row.learning" /></template>
        </ElTableColumn>
        <ElTableColumn label="Thao tác" width="130">
          <template #default><ElButton type="primary" link>Sửa</ElButton><ElButton type="danger" link>Xóa</ElButton></template>
        </ElTableColumn>
      </ElTable>`,
  }),
}
