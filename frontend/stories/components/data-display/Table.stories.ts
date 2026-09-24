import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { reactive, ref } from 'vue'

/**
 * `ElTable` states. The full list-screen layout (filters, row actions, pagination) is in **Patterns › DataTable**.
 * - Text left-aligned, numbers and money right-aligned in mono, short codes centered.
 * - Sort only columns people actually sort by (name, date, amount).
 * - Loading keeps the old rows under a light mask so the layout doesn't jump.
 * - An empty table says what is missing and, when possible, what to do next.
 */
const meta = {
  title: 'Components/Data display/Table',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const rows = [
  { code: 'HV001', name: 'Nguyễn Văn An', enrolledOn: '2026-09-01', paid: 8500000 },
  { code: 'HV002', name: 'Trần Thị Bích', enrolledOn: '2026-09-03', paid: 5000000 },
  { code: 'HV004', name: 'Phạm Thu Dung', enrolledOn: '2026-08-28', paid: 0 },
  { code: 'HV005', name: 'Vũ Minh Đức', enrolledOn: '2026-09-05', paid: 3000000 },
]
const money = (v: number) => `${v.toLocaleString('vi-VN')} ₫`
const date = (v: string) => v.split('-').reverse().join('/')

/** Select rows for a bulk action; the action bar appears only while something is selected. */
export const SortAndSelect: Story = {
  render: () => ({
    setup: () => ({ rows, money, date, selected: ref<unknown[]>([]) }),
    template: `
      <div>
        <div class="sb-row" style="min-height:40px">
          <template v-if="selected.length">
            <span>Đã chọn <strong>{{ selected.length }}</strong> học viên</span>
            <el-button type="primary" plain size="small">Chuyển lớp</el-button>
          </template>
        </div>
        <el-table :data="rows" :default-sort="{ prop: 'enrolledOn', order: 'descending' }" @selection-change="(s) => (selected = s)">
          <el-table-column type="selection" width="48" />
          <el-table-column prop="code" label="Mã" width="100" align="center"><template #default="{ row }"><span class="num">{{ row.code }}</span></template></el-table-column>
          <el-table-column prop="name" label="Họ và tên" sortable min-width="180" />
          <el-table-column prop="enrolledOn" label="Ngày ghi danh" sortable width="170"><template #default="{ row }"><span class="num">{{ date(row.enrolledOn) }}</span></template></el-table-column>
          <el-table-column prop="paid" label="Đã đóng" sortable width="160" align="right"><template #default="{ row }"><span class="num">{{ money(row.paid) }}</span></template></el-table-column>
        </el-table>
      </div>`,
  }),
}

export const Loading: Story = {
  render: () => ({
    setup: () => ({ rows }),
    template: `
      <el-table v-loading="true" element-loading-text="Đang tải..." :data="rows">
        <el-table-column prop="code" label="Mã" width="100" />
        <el-table-column prop="name" label="Họ và tên" />
      </el-table>`,
  }),
}

export const Empty: Story = {
  render: () => ({
    template: `
      <el-table :data="[]">
        <el-table-column prop="code" label="Mã" width="100" />
        <el-table-column prop="name" label="Họ và tên" />
        <template #empty>
          <el-empty description="Không có học viên nào khớp bộ lọc" :image-size="80">
            <el-button type="primary" plain>Xóa bộ lọc</el-button>
          </el-empty>
        </template>
      </el-table>`,
  }),
}

/** Dense tables (grade entry) use the small size and inline inputs. */
export const Dense: Story = {
  render: () => ({
    setup: () => ({ rows: reactive(rows.map((r, i) => ({ ...r, score: [6.5, 7, null, 5.5][i] }))) }),
    template: `
      <el-table :data="rows" size="small" style="max-width:520px">
        <el-table-column prop="code" label="Mã" width="90" />
        <el-table-column prop="name" label="Họ và tên" />
        <el-table-column label="Tổng" width="120" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.score" :min="0" :max="9" :step="0.5" :controls="false" size="small" :aria-label="'Band tổng của ' + row.name" style="width:80px" />
          </template>
        </el-table-column>
      </el-table>`,
  }),
}
