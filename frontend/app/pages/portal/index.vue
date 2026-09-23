<script setup lang="ts">
import type { MyClass } from '~/types/api'

definePageMeta({ layout: 'portal', roles: ['Student'] })

const { t } = useI18n()
useHead({ title: () => t('nav.myClasses') })

const api = useApi()
const auth = useAuthStore()
const { date, money } = useFormat()
const { notifyError } = useApiErrors()
const classes = ref<MyClass[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    classes.value = await api.portal.classes()
  } catch (error) {
    notifyError(error)
  } finally {
    loading.value = false
  }
})

const attendanceRate = (c: MyClass) => (c.sessionsRecorded ? Math.round((c.sessionsAttended / c.sessionsRecorded) * 100) : 0)
</script>

<template>
  <div v-loading="loading" class="page">
    <PageHeader :title="t('portal.welcome', { name: auth.user?.fullName ?? auth.user?.username })" :subtitle="t('nav.myClasses')" />
    <ElEmpty v-if="!loading && !classes.length" :description="t('portal.noClasses')" />
    <ElRow :gutter="16">
      <ElCol v-for="c in classes" :key="c.enrollmentId" :xs="24" :md="12" class="card-col">
        <ElCard shadow="hover">
          <template #header>
            <div class="card-header">
              <div>
                <strong>{{ c.courseName }}</strong>
                <div class="muted">{{ c.classCode }} · {{ c.className }}</div>
              </div>
              <StatusTag group="learningStatus" :value="c.learningStatus" />
            </div>
          </template>
          <ElDescriptions :column="1" size="small">
            <ElDescriptionsItem :label="t('fields.teacherName')">{{ c.teacherName ?? '—' }}</ElDescriptionsItem>
            <ElDescriptionsItem :label="t('fields.schedule')">{{ c.schedule ?? '—' }} · {{ c.room ?? '' }}</ElDescriptionsItem>
            <ElDescriptionsItem :label="t('fields.startDate')">{{ date(c.startDate) }} → {{ date(c.endDate) }}</ElDescriptionsItem>
            <ElDescriptionsItem :label="t('fields.paymentStatus')">
              <StatusTag group="paymentStatus" :value="c.paymentStatus" />
              <span v-if="c.balance > 0" class="muted"> · {{ t('fields.balance') }}: {{ money(c.balance) }}</span>
            </ElDescriptionsItem>
          </ElDescriptions>
          <div class="attendance">
            <span class="muted">{{ t('portal.sessions', { attended: c.sessionsAttended, recorded: c.sessionsRecorded }) }}</span>
            <ElProgress :percentage="attendanceRate(c)" :status="attendanceRate(c) < 80 && c.sessionsRecorded ? 'warning' : 'success'" />
          </div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<style scoped>
.card-col {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.attendance {
  margin-top: 12px;
}
</style>
