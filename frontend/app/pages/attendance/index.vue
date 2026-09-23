<script setup lang="ts">
import type { AttendanceSheet, Option } from '~/types/api'

definePageMeta({ roles: ['Admin', 'Staff'] })

const { t } = useI18n()
useHead({ title: () => t('nav.attendance') })

const api = useApi()
const route = useRoute()
const { notifyError } = useApiErrors()

interface Row {
  enrollmentId: number
  studentCode: string
  studentName: string
  isPresent: boolean
  taken: boolean
  note: string
}

const classes = ref<Option[]>([])
const classId = ref<number | undefined>(route.query.classId ? Number(route.query.classId) : undefined)
const sessionNumber = ref(1)
const sessionDate = ref<string>(new Date().toISOString().slice(0, 10))
const sheet = ref<AttendanceSheet>()
const rows = ref<Row[]>([])
const loading = ref(false)
const saving = ref(false)

onMounted(async () => {
  classes.value = await api.classes.options().catch(() => [])
  if (classId.value) await loadSheet()
})

function applySheet(data: AttendanceSheet) {
  sheet.value = data
  if (data.sessionDate) sessionDate.value = data.sessionDate
  rows.value = data.rows.map((r) => ({
    enrollmentId: r.enrollmentId,
    studentCode: r.studentCode,
    studentName: r.studentName,
    isPresent: r.isPresent ?? true,
    taken: r.isPresent !== null,
    note: r.note ?? '',
  }))
}

async function loadSheet() {
  if (!classId.value) return
  loading.value = true
  try {
    applySheet(await api.attendance.sheet(classId.value, sessionNumber.value))
  } catch (error) {
    notifyError(error)
  } finally {
    loading.value = false
  }
}

function markAll(present: boolean) {
  rows.value.forEach((r) => (r.isPresent = present))
}

async function save() {
  if (!sheet.value) return
  saving.value = true
  try {
    applySheet(
      await api.attendance.saveSheet({
        classId: sheet.value.classId,
        sessionNumber: sessionNumber.value,
        sessionDate: sessionDate.value,
        entries: rows.value.map((r) => ({ enrollmentId: r.enrollmentId, isPresent: r.isPresent, note: r.note || null })),
      }),
    )
    ElMessage.success(t('common.saved'))
  } catch (error) {
    notifyError(error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="page">
    <PageHeader :title="t('attendance.title')" :subtitle="t('attendance.pickClass')" />

    <ElCard shadow="never">
      <div class="toolbar">
        <ElSelect v-model="classId" :placeholder="t('fields.class')" filterable style="width: 280px" @change="loadSheet">
          <ElOption v-for="c in classes" :key="c.id" :value="c.id" :label="c.label" />
        </ElSelect>
        <ElInputNumber
          v-model="sessionNumber"
          :min="1"
          :max="sheet?.totalSessions ?? 200"
          controls-position="right"
          @change="loadSheet"
        >
          <template #prefix>{{ t('fields.sessionNumber') }}</template>
        </ElInputNumber>
        <ElDatePicker v-model="sessionDate" type="date" value-format="YYYY-MM-DD" :clearable="false" />
        <span v-if="sheet" class="muted">/ {{ sheet.totalSessions }}</span>
      </div>
    </ElCard>

    <ElCard v-if="sheet" v-loading="loading" shadow="never">
      <template #header>
        <div class="toolbar" style="justify-content: space-between">
          <strong>{{ sheet.classCode }} · {{ sheet.className }}</strong>
          <div class="toolbar">
            <ElButton @click="markAll(true)">{{ t('attendance.allPresent') }}</ElButton>
            <ElButton @click="markAll(false)">{{ t('attendance.allAbsent') }}</ElButton>
            <ElButton type="primary" :loading="saving" :disabled="!rows.length" @click="save">{{ t('common.save') }}</ElButton>
          </div>
        </div>
      </template>
      <ElTable :data="rows" :empty-text="t('common.noData')">
        <ElTableColumn type="index" width="60" />
        <ElTableColumn prop="studentCode" :label="t('fields.code')" width="130" />
        <ElTableColumn :label="t('fields.fullName')" min-width="200">
          <template #default="{ row }">
            {{ row.studentName }}
            <ElTag v-if="!row.taken" size="small" type="info" style="margin-left: 8px">{{ t('attendance.notTaken') }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.isPresent')" width="200">
          <template #default="{ row }">
            <ElRadioGroup v-model="row.isPresent" size="small">
              <ElRadioButton :value="true">{{ t('attendance.present') }}</ElRadioButton>
              <ElRadioButton :value="false">{{ t('attendance.absent') }}</ElRadioButton>
            </ElRadioGroup>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.note')" min-width="220">
          <template #default="{ row }">
            <ElInput v-model="row.note" maxlength="250" size="small" />
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>
