<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { CreateEnrollment, Enrollment, Option } from '~/types/api'
import type { LearningStatus } from '~/types/enums'

const visible = defineModel<boolean>({ required: true })
const props = defineProps<{ enrollment?: Enrollment | null }>()
const emit = defineEmits<{ saved: [] }>()

const { t } = useI18n()
const api = useApi()
const rules = useFormRules()
const { options } = useEnumOptions()
const { money } = useFormat()
const { notifyError } = useApiErrors()

const formRef = ref<FormInstance>()
const saving = ref(false)
const students = ref<Option[]>([])
const classes = ref<Option[]>([])
const form = reactive<CreateEnrollment & { learningStatus: LearningStatus }>({
  studentId: null,
  classId: null,
  enrolledOn: null,
  tuitionFee: null,
  amountPaid: 0,
  learningStatus: 'Studying',
})
const isEdit = computed(() => !!props.enrollment)

watch(visible, async (open) => {
  if (!open) return
  const e = props.enrollment
  Object.assign(form, {
    studentId: e?.studentId ?? null,
    classId: e?.classId ?? null,
    enrolledOn: e?.enrolledOn ?? null,
    tuitionFee: e?.tuitionFee ?? null,
    amountPaid: e?.amountPaid ?? 0,
    learningStatus: e?.learningStatus ?? 'Studying',
  })
  nextTick(() => formRef.value?.clearValidate())
  if (!e) {
    try {
      ;[students.value, classes.value] = await Promise.all([api.students.options(), api.classes.options()])
    } catch (error) {
      notifyError(error)
    }
  }
})

const formRules = computed<FormRules>(() => ({
  studentId: isEdit.value ? [] : [rules.required()],
  classId: isEdit.value ? [] : [rules.required()],
  tuitionFee: isEdit.value ? [rules.required()] : [],
  amountPaid: [rules.required()],
}))

async function submit() {
  if (!(await formRef.value?.validate().catch(() => false))) return
  saving.value = true
  try {
    if (props.enrollment) {
      await api.enrollments.update(props.enrollment.id, {
        tuitionFee: form.tuitionFee ?? 0,
        amountPaid: form.amountPaid,
        learningStatus: form.learningStatus,
      })
    } else {
      const { learningStatus: _, ...body } = form
      await api.enrollments.create(body)
    }
    ElMessage.success(t('common.saved'))
    emit('saved')
    visible.value = false
  } catch (error) {
    notifyError(error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <ElDialog v-model="visible" :title="isEdit ? t('enrollments.edit') : t('enrollments.create')" width="600px">
    <ElForm ref="formRef" :model="form" :rules="formRules" label-position="top" class="form-grid">
      <template v-if="enrollment">
        <ElFormItem :label="t('fields.student')" class="full">
          <strong>{{ enrollment.studentCode }} · {{ enrollment.studentName }}</strong>
          <span class="muted" style="margin-left: 8px">{{ enrollment.classCode }} · {{ enrollment.courseName }}</span>
        </ElFormItem>
      </template>
      <template v-else>
        <ElFormItem :label="t('fields.student')" prop="studentId" class="full">
          <ElSelect v-model="form.studentId" filterable :placeholder="t('common.select')">
            <ElOption v-for="s in students" :key="s.id" :value="s.id" :label="s.label" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem :label="t('fields.class')" prop="classId" class="full">
          <ElSelect v-model="form.classId" filterable :placeholder="t('common.select')">
            <ElOption v-for="c in classes" :key="c.id" :value="c.id" :label="c.label" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem :label="t('fields.enrolledOn')" prop="enrolledOn">
          <ElDatePicker v-model="form.enrolledOn" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </ElFormItem>
      </template>
      <ElFormItem :label="t('fields.tuitionFee')" prop="tuitionFee">
        <ElInputNumber
          v-model="form.tuitionFee"
          :min="0"
          :step="100000"
          :placeholder="isEdit ? undefined : t('enrollments.feeHint')"
          controls-position="right"
          style="width: 100%"
          :value-on-clear="null"
        />
      </ElFormItem>
      <ElFormItem :label="t('fields.amountPaid')" prop="amountPaid">
        <ElInputNumber v-model="form.amountPaid" :min="0" :step="100000" controls-position="right" style="width: 100%" />
      </ElFormItem>
      <ElFormItem v-if="enrollment" :label="t('fields.learningStatus')" prop="learningStatus">
        <ElSelect v-model="form.learningStatus">
          <ElOption v-for="o in options('learningStatus')" :key="o.value" :value="o.value" :label="o.label" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem v-if="form.tuitionFee != null" :label="t('fields.balance')">
        {{ money(Math.max(form.tuitionFee - form.amountPaid, 0)) }}
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="saving" @click="submit">{{ t('common.save') }}</ElButton>
    </template>
  </ElDialog>
</template>
