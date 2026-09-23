<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { CourseClass, Option, SaveClass } from '~/types/api'

const visible = defineModel<boolean>({ required: true })
const props = defineProps<{ courseClass?: CourseClass | null }>()
const emit = defineEmits<{ saved: [courseClass: CourseClass] }>()

const { t } = useI18n()
const api = useApi()
const rules = useFormRules()
const { notifyError } = useApiErrors()

const formRef = ref<FormInstance>()
const saving = ref(false)
const courses = ref<Option[]>([])
const empty = (): SaveClass => ({
  code: '',
  name: '',
  courseId: null,
  teacherName: null,
  schedule: null,
  room: null,
  startDate: null,
  endDate: null,
  maxCapacity: 20,
})
const form = reactive<SaveClass>(empty())

watch(visible, async (open) => {
  if (!open) return
  Object.assign(form, props.courseClass ? { ...props.courseClass } : empty())
  nextTick(() => formRef.value?.clearValidate())
  try {
    courses.value = await api.courses.options(!props.courseClass)
  } catch (error) {
    notifyError(error)
  }
})

const formRules = computed<FormRules>(() => ({
  code: [rules.required(), rules.max(20), rules.code()],
  name: [rules.required(), rules.max(150)],
  courseId: [rules.required()],
  teacherName: [rules.max(100)],
  schedule: [rules.max(100)],
  room: [rules.max(50)],
  startDate: [rules.required()],
  maxCapacity: [rules.required(), rules.between(1, 100)],
}))

async function submit() {
  if (!(await formRef.value?.validate().catch(() => false))) return
  saving.value = true
  try {
    const body: SaveClass = { ...form }
    const saved = props.courseClass
      ? await api.classes.update(props.courseClass.id, body)
      : await api.classes.create(body)
    ElMessage.success(t('common.saved'))
    emit('saved', saved)
    visible.value = false
  } catch (error) {
    notifyError(error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <ElDialog v-model="visible" :title="courseClass ? t('classes.edit') : t('classes.create')" width="680px">
    <ElForm ref="formRef" :model="form" :rules="formRules" label-position="top" class="form-grid">
      <ElFormItem :label="t('fields.code')" prop="code">
        <ElInput v-model="form.code" maxlength="20" style="text-transform: uppercase" />
      </ElFormItem>
      <ElFormItem :label="t('fields.course')" prop="courseId">
        <ElSelect v-model="form.courseId" filterable :placeholder="t('common.select')">
          <ElOption v-for="c in courses" :key="c.id" :value="c.id" :label="c.label" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t('fields.name')" prop="name" class="full">
        <ElInput v-model="form.name" maxlength="150" />
      </ElFormItem>
      <ElFormItem :label="t('fields.teacherName')" prop="teacherName">
        <ElInput v-model="form.teacherName" maxlength="100" />
      </ElFormItem>
      <ElFormItem :label="t('fields.room')" prop="room">
        <ElInput v-model="form.room" maxlength="50" />
      </ElFormItem>
      <ElFormItem :label="t('fields.schedule')" prop="schedule" class="full">
        <ElInput v-model="form.schedule" maxlength="100" placeholder="T2-T4-T6 18:00-20:00" />
      </ElFormItem>
      <ElFormItem :label="t('fields.startDate')" prop="startDate">
        <ElDatePicker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
      </ElFormItem>
      <ElFormItem :label="t('fields.endDate')" prop="endDate">
        <ElDatePicker
          v-model="form.endDate"
          type="date"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :disabled-date="(d: Date) => !!form.startDate && d < new Date(`${form.startDate}T00:00:00`)"
        />
      </ElFormItem>
      <ElFormItem :label="t('fields.maxCapacity')" prop="maxCapacity">
        <ElInputNumber v-model="form.maxCapacity" :min="1" :max="100" controls-position="right" style="width: 100%" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="saving" @click="submit">{{ t('common.save') }}</ElButton>
    </template>
  </ElDialog>
</template>
