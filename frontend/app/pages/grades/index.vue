<script setup lang="ts">
import type { GradeRow, GradeSheet, Option } from '~/types/api'
import { SKILLS, type ExamType } from '~/types/enums'

definePageMeta({ roles: ['Admin', 'Staff'] })

const { t } = useI18n()
useHead({ title: () => t('nav.grades') })

const api = useApi()
const route = useRoute()
const { options, label } = useEnumOptions()
const { score } = useFormat()
const { notifyError } = useApiErrors()

const classes = ref<Option[]>([])
const classId = ref<number | undefined>(route.query.classId ? Number(route.query.classId) : undefined)
const examType = ref<ExamType>('Midterm')
const sheet = ref<GradeSheet>()
const loading = ref(false)
const saving = ref(false)

onMounted(async () => {
  classes.value = await api.classes.options().catch(() => [])
  if (classId.value) await loadSheet()
})

async function loadSheet() {
  if (!classId.value) return
  loading.value = true
  try {
    sheet.value = await api.grades.sheet(classId.value, examType.value)
  } catch (error) {
    notifyError(error)
  } finally {
    loading.value = false
  }
}

const ranges = computed(() =>
  sheet.value ? Object.fromEntries(SKILLS.map((s) => [s, scoreRange(sheet.value!.gradingScheme, s)])) : null,
)

async function save() {
  if (!sheet.value) return
  saving.value = true
  try {
    sheet.value = await api.grades.saveSheet({
      classId: sheet.value.classId,
      examType: sheet.value.examType,
      entries: sheet.value.rows.map(({ enrollmentId, listening, reading, writing, speaking, feedback }) => ({
        enrollmentId,
        listening,
        reading,
        writing,
        speaking,
        feedback: feedback || null,
      })),
    })
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
    <PageHeader :title="t('grades.title')" :subtitle="t('grades.pickClass')" />

    <ElCard shadow="never">
      <div class="toolbar">
        <ElSelect v-model="classId" :placeholder="t('fields.class')" :aria-label="t('fields.class')" filterable style="width: 280px" @change="loadSheet">
          <ElOption v-for="c in classes" :key="c.id" :value="c.id" :label="c.label" />
        </ElSelect>
        <ElSelect v-model="examType" :aria-label="t('fields.examType')" @change="loadSheet">
          <ElOption v-for="o in options('examType')" :key="o.value" :value="o.value" :label="o.label" />
        </ElSelect>
      </div>
    </ElCard>

    <ElCard v-if="sheet && ranges" v-loading="loading" shadow="never">
      <template #header>
        <div class="toolbar" style="justify-content: space-between">
          <div>
            <strong>{{ sheet.classCode }} · {{ sheet.className }}</strong>
            <div class="muted">
              {{ t('grades.rangeHint', { scheme: label('gradingScheme', sheet.gradingScheme), min: ranges.listening!.min, max: ranges.listening!.max }) }}
              · {{ t('grades.overallHint') }}
            </div>
          </div>
          <ElButton type="primary" :loading="saving" :disabled="!sheet.rows.length" @click="save">{{ t('common.save') }}</ElButton>
        </div>
      </template>
      <ElTable :data="sheet.rows" :empty-text="t('common.noData')">
        <ElTableColumn prop="studentCode" :label="t('fields.code')" width="110" />
        <ElTableColumn prop="studentName" :label="t('fields.fullName')" min-width="180" />
        <ElTableColumn v-for="skill in SKILLS" :key="skill" :label="t(`fields.${skill}`)" width="130" align="center">
          <template #default="{ row }">
            <ElInputNumber
              v-model="row[skill]"
              :aria-label="`${row.studentName} · ${t(`fields.${skill}`)}`"
              :min="ranges[skill]!.min"
              :max="ranges[skill]!.max"
              :step="ranges[skill]!.step"
              :precision="ranges[skill]!.step < 1 ? 1 : 0"
              :controls="false"
              :value-on-clear="null"
              size="small"
              style="width: 100%"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.overall')" width="90" align="center">
          <template #default="{ row }">
            <strong>{{ score(previewOverall(sheet.gradingScheme, row as GradeRow)) }}</strong>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.feedback')" min-width="220">
          <template #default="{ row }">
            <ElInput v-model="row.feedback" :aria-label="`${row.studentName} · ${t('fields.feedback')}`" maxlength="500" size="small" />
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>
