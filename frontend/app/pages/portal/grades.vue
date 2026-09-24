<script setup lang="ts">
import type { MyGrade } from '~/types/api'

definePageMeta({ layout: 'portal', roles: ['Student'] })

const { t } = useI18n()
useHead({ title: () => t('nav.myGrades') })

const api = useApi()
const { score } = useFormat()
const { label } = useEnumOptions()
const { notifyError } = useApiErrors()
const grades = ref<MyGrade[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    grades.value = await api.portal.grades()
  } catch (error) {
    notifyError(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <PageHeader :title="t('nav.myGrades')" />
    <ElCard shadow="never">
      <ElTable v-loading="loading" :data="grades" :empty-text="t('common.noData')">
        <ElTableColumn :label="t('fields.class')" min-width="180">
          <template #default="{ row }">
            {{ row.courseName }}
            <div class="muted">{{ row.classCode }} · {{ label('gradingScheme', row.gradingScheme) }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.examType')" min-width="140">
          <template #default="{ row }">{{ label('examType', row.examType) }}</template>
        </ElTableColumn>
        <ElTableColumn v-for="skill in ['listening', 'reading', 'writing', 'speaking']" :key="skill" :label="t(`fields.${skill}`)" min-width="96" align="center">
          <template #default="{ row }">{{ score(row[skill]) }}</template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.overall')" min-width="90" align="center">
          <template #default="{ row }"><strong>{{ score(row.overall) }}</strong></template>
        </ElTableColumn>
        <ElTableColumn prop="feedback" :label="t('fields.feedback')" min-width="200" />
      </ElTable>
    </ElCard>
  </div>
</template>
