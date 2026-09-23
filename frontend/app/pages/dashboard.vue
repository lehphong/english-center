<script setup lang="ts">
import type { Dashboard } from '~/types/api'

definePageMeta({ roles: ['Admin', 'Staff'] })

const { t } = useI18n()
useHead({ title: () => t('nav.dashboard') })

const api = useApi()
const { money } = useFormat()
const { notifyError } = useApiErrors()
const data = ref<Dashboard>()
const loading = ref(true)

onMounted(async () => {
  try {
    data.value = await api.dashboard.get()
  } catch (error) {
    notifyError(error)
  } finally {
    loading.value = false
  }
})

const stats = computed(() =>
  data.value
    ? [
        { label: t('dashboard.activeCourses'), value: data.value.activeCourses },
        { label: t('dashboard.openClasses'), value: data.value.openClasses },
        { label: t('dashboard.students'), value: data.value.students },
        { label: t('dashboard.activeEnrollments'), value: data.value.activeEnrollments },
        { label: t('dashboard.collected'), value: money(data.value.collectedTuition) },
        { label: t('dashboard.outstanding'), value: money(data.value.outstandingTuition) },
      ]
    : [],
)
</script>

<template>
  <div v-loading="loading" class="page">
    <PageHeader :title="t('nav.dashboard')" />
    <ElRow :gutter="16">
      <ElCol v-for="stat in stats" :key="stat.label" :xs="24" :sm="12" :lg="8" class="stat-col">
        <ElCard shadow="never">
          <div class="muted">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
        </ElCard>
      </ElCol>
    </ElRow>
    <ElCard shadow="never" :header="t('dashboard.occupancy')">
      <ElTable :data="data?.openClassOccupancy ?? []" :empty-text="t('common.noData')">
        <ElTableColumn :label="t('fields.code')" width="140">
          <template #default="{ row }">
            <NuxtLink :to="`/classes/${row.classId}`">{{ row.classCode }}</NuxtLink>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="className" :label="t('fields.name')" />
        <ElTableColumn :label="t('fields.enrolled')" width="320">
          <template #default="{ row }">
            <ElProgress
              :percentage="Math.round((row.enrolled / row.maxCapacity) * 100)"
              :format="() => `${row.enrolled}/${row.maxCapacity}`"
              :status="row.enrolled >= row.maxCapacity ? 'exception' : undefined"
            />
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<style scoped>
.stat-col {
  margin-bottom: 16px;
}

.stat-value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 600;
}
</style>
