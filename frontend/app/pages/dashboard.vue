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
        // Chỉ một con số mang màu nhấn: học phí đã thu là điều giáo vụ nhìn đầu tiên
        { label: t('dashboard.collected'), value: money(data.value.collectedTuition), accent: true },
        { label: t('dashboard.outstanding'), value: money(data.value.outstandingTuition) },
        { label: t('dashboard.activeEnrollments'), value: data.value.activeEnrollments },
        { label: t('dashboard.students'), value: data.value.students },
        { label: t('dashboard.openClasses'), value: data.value.openClasses },
        { label: t('dashboard.activeCourses'), value: data.value.activeCourses },
      ]
    : [],
)
</script>

<template>
  <div v-loading="loading" class="page">
    <PageHeader :title="t('nav.dashboard')" />
    <div class="stats">
      <StatCard v-for="stat in stats" :key="stat.label" :label="stat.label" :value="stat.value" :accent="stat.accent" />
    </div>
    <ElCard shadow="never" :header="t('dashboard.occupancy')">
      <ElTable :data="data?.openClassOccupancy ?? []" :empty-text="t('common.noData')">
        <ElTableColumn :label="t('fields.code')" width="160">
          <template #default="{ row }">
            <NuxtLink :to="`/classes/${row.classId}`" class="num">{{ row.classCode }}</NuxtLink>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="className" :label="t('fields.name')" />
        <ElTableColumn :label="t('fields.enrolled')" width="320">
          <template #default="{ row }">
            <ElProgress
              :aria-label="t('dashboard.occupancyOf', { code: row.classCode })"
              :percentage="Math.round((row.enrolled / row.maxCapacity) * 100)"
              :format="() => `${row.enrolled}/${row.maxCapacity}`"
              :status="row.enrolled >= row.maxCapacity ? 'exception' : undefined"
              :stroke-width="6"
            />
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<style scoped>
/* 6 chỉ số: 3 cột × 2 hàng, không để thẻ nào đứng lẻ */
.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

@media (max-width: 1100px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
