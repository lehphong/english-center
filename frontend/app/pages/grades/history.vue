<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import type { Grade, GradeQuery, Option } from '~/types/api'

definePageMeta({ roles: ['Admin', 'Staff'] })

const { t } = useI18n()
useHead({ title: () => t('nav.gradeHistory') })

const api = useApi()
const { score } = useFormat()
const { options, label } = useEnumOptions()
const { confirmDelete } = useConfirm()
const { notifyError } = useApiErrors()

const classes = ref<Option[]>([])
const { query, items, total, loading, load, search } = usePagedList((q) => api.grades.list(q), {
  search: '',
  classId: undefined,
  examType: undefined,
} as GradeQuery)

onMounted(async () => {
  classes.value = await api.classes.options().catch(() => [])
})

async function remove(grade: Grade) {
  if (!(await confirmDelete(`${grade.studentName} · ${label('examType', grade.examType)}`))) return
  try {
    await api.grades.remove(grade.id)
    ElMessage.success(t('common.deleted'))
    await load()
  } catch (error) {
    notifyError(error)
  }
}
</script>

<template>
  <div class="page">
    <PageHeader :title="t('grades.historyTitle')" />
    <ElCard shadow="never">
      <div class="toolbar">
        <ElInput v-model="query.search" :placeholder="t('common.searchPlaceholder')" :aria-label="t('common.searchPlaceholder')" :prefix-icon="Search" clearable @keyup.enter="search" @clear="search" />
        <ElSelect v-model="query.classId" :placeholder="t('fields.class')" :aria-label="t('fields.class')" clearable filterable @change="search">
          <ElOption v-for="c in classes" :key="c.id" :value="c.id" :label="c.label" />
        </ElSelect>
        <ElSelect v-model="query.examType" :placeholder="t('fields.examType')" :aria-label="t('fields.examType')" clearable @change="search">
          <ElOption v-for="o in options('examType')" :key="o.value" :value="o.value" :label="o.label" />
        </ElSelect>
      </div>

      <ElTable v-loading="loading" :data="items" :empty-text="t('common.noData')" style="margin-top: 16px">
        <ElTableColumn :label="t('fields.student')" min-width="190">
          <template #default="{ row }">
            <strong>{{ row.studentName }}</strong>
            <div class="muted">{{ row.studentCode }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.class')" min-width="170">
          <template #default="{ row }">
            {{ row.classCode }}
            <div class="muted">{{ label('gradingScheme', row.gradingScheme) }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.examType')" width="150">
          <template #default="{ row }">{{ label('examType', row.examType) }}</template>
        </ElTableColumn>
        <ElTableColumn v-for="skill in ['listening', 'reading', 'writing', 'speaking']" :key="skill" :label="t(`fields.${skill}`)" width="110" align="center">
          <template #default="{ row }">{{ score(row[skill]) }}</template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.overall')" width="100" align="center">
          <template #default="{ row }"><strong>{{ score(row.overall) }}</strong></template>
        </ElTableColumn>
        <ElTableColumn prop="feedback" :label="t('fields.feedback')" min-width="180" />
        <ElTableColumn :label="t('common.actions')" width="90" fixed="right">
          <template #default="{ row }">
            <ElButton link type="danger" @click="remove(row as Grade)">{{ t('common.delete') }}</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <ListPagination v-model:page="query.page" v-model:page-size="query.pageSize" :total="total" @change="load" />
    </ElCard>
  </div>
</template>
