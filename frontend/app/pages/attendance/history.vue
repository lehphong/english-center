<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import type { AttendanceQuery, AttendanceRecord, Option } from '~/types/api'

definePageMeta({ roles: ['Admin', 'Staff'] })

const { t } = useI18n()
useHead({ title: () => t('nav.attendanceHistory') })

const api = useApi()
const { date } = useFormat()
const { confirmDelete } = useConfirm()
const { notifyError } = useApiErrors()

const classes = ref<Option[]>([])
const { query, items, total, loading, load, search } = usePagedList((q) => api.attendance.list(q), {
  search: '',
  classId: undefined,
  sessionNumber: undefined,
  isPresent: undefined,
} as AttendanceQuery)

onMounted(async () => {
  classes.value = await api.classes.options().catch(() => [])
})

async function remove(record: AttendanceRecord) {
  if (!(await confirmDelete(`${record.studentName} · ${t('fields.sessionNumber')} ${record.sessionNumber}`))) return
  try {
    await api.attendance.remove(record.id)
    ElMessage.success(t('common.deleted'))
    await load()
  } catch (error) {
    notifyError(error)
  }
}
</script>

<template>
  <div class="page">
    <PageHeader :title="t('attendance.historyTitle')" />
    <ElCard shadow="never">
      <div class="toolbar">
        <ElInput v-model="query.search" :placeholder="t('common.searchPlaceholder')" :prefix-icon="Search" clearable @keyup.enter="search" @clear="search" />
        <ElSelect v-model="query.classId" :placeholder="t('fields.class')" clearable filterable @change="search">
          <ElOption v-for="c in classes" :key="c.id" :value="c.id" :label="c.label" />
        </ElSelect>
        <ElInputNumber v-model="query.sessionNumber" :min="1" :placeholder="t('fields.sessionNumber')" controls-position="right" @change="search" />
        <ElSelect v-model="query.isPresent" :placeholder="t('fields.isPresent')" clearable @change="search">
          <ElOption :value="true" :label="t('attendance.present')" />
          <ElOption :value="false" :label="t('attendance.absent')" />
        </ElSelect>
      </div>

      <ElTable v-loading="loading" :data="items" :empty-text="t('common.noData')" style="margin-top: 16px">
        <ElTableColumn :label="t('fields.student')" min-width="200">
          <template #default="{ row }">
            <strong>{{ row.studentName }}</strong>
            <div class="muted">{{ row.studentCode }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="classCode" :label="t('fields.class')" width="150" />
        <ElTableColumn prop="sessionNumber" :label="t('fields.sessionNumber')" width="100" align="center" />
        <ElTableColumn :label="t('fields.sessionDate')" width="130">
          <template #default="{ row }">{{ date(row.sessionDate) }}</template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.isPresent')" width="120">
          <template #default="{ row }">
            <StatusTag :tone="row.isPresent ? 'success' : 'danger'" :label="row.isPresent ? t('attendance.present') : t('attendance.absent')" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="note" :label="t('fields.note')" min-width="180" />
        <ElTableColumn :label="t('common.actions')" width="100" fixed="right">
          <template #default="{ row }">
            <ElButton link type="danger" @click="remove(row as AttendanceRecord)">{{ t('common.delete') }}</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <ElPagination
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        class="pagination"
        layout="total, sizes, prev, pager, next"
        :total="total"
        @change="load"
      />
    </ElCard>
  </div>
</template>
