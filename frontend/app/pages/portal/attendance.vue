<script setup lang="ts">
import type { MyAttendance, MyClass } from '~/types/api'

definePageMeta({ layout: 'portal', roles: ['Student'] })

const { t } = useI18n()
useHead({ title: () => t('nav.myAttendance') })

const api = useApi()
const { date } = useFormat()
const { notifyError } = useApiErrors()

const classes = ref<MyClass[]>([])
const enrollmentId = ref<number>()
const records = ref<MyAttendance[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    records.value = await api.portal.attendance(enrollmentId.value)
  } catch (error) {
    notifyError(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  classes.value = await api.portal.classes().catch(() => [])
  await load()
})
</script>

<template>
  <div class="page">
    <PageHeader :title="t('nav.myAttendance')" />
    <ElCard shadow="never">
      <div class="toolbar">
        <ElSelect v-model="enrollmentId" :placeholder="t('fields.class')" :aria-label="t('fields.class')" clearable @change="load">
          <ElOption v-for="c in classes" :key="c.enrollmentId" :value="c.enrollmentId" :label="`${c.classCode} · ${c.courseName}`" />
        </ElSelect>
      </div>
      <ElTable v-loading="loading" :data="records" :empty-text="t('common.noData')" style="margin-top: 16px">
        <ElTableColumn prop="classCode" :label="t('fields.class')" width="160" />
        <ElTableColumn prop="sessionNumber" :label="t('fields.sessionNumber')" width="100" align="center" />
        <ElTableColumn :label="t('fields.sessionDate')" width="140">
          <template #default="{ row }">{{ date(row.sessionDate) }}</template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.isPresent')" width="130">
          <template #default="{ row }">
            <StatusTag :tone="row.isPresent ? 'success' : 'danger'" :label="row.isPresent ? t('attendance.present') : t('attendance.absent')" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="note" :label="t('fields.note')" />
      </ElTable>
    </ElCard>
  </div>
</template>
