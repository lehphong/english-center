<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { Course, SaveCourse } from '~/types/api'

const visible = defineModel<boolean>({ required: true })
const props = defineProps<{ course?: Course | null }>()
const emit = defineEmits<{ saved: [course: Course] }>()

const { t } = useI18n()
const api = useApi()
const rules = useFormRules()
const { options } = useEnumOptions()
const { notifyError } = useApiErrors()

const formRef = ref<FormInstance>()
const saving = ref(false)
const empty = (): SaveCourse => ({
  name: '',
  description: null,
  tuitionFee: 0,
  totalSessions: 24,
  gradingScheme: 'Standard',
  isActive: true,
})
const form = reactive<SaveCourse>(empty())

watch(visible, (open) => {
  if (!open) return
  const c = props.course
  Object.assign(form, c ? { ...c } : empty())
  nextTick(() => formRef.value?.clearValidate())
})

const formRules = computed<FormRules>(() => ({
  name: [rules.required(), rules.max(150)],
  description: [rules.max(4000)],
  tuitionFee: [rules.required(), rules.between(0, 1_000_000_000)],
  totalSessions: [rules.required(), rules.between(1, 200)],
  gradingScheme: [rules.required()],
}))

async function submit() {
  if (!(await formRef.value?.validate().catch(() => false))) return
  saving.value = true
  try {
    const body: SaveCourse = { ...form }
    const saved = props.course ? await api.courses.update(props.course.id, body) : await api.courses.create(body)
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
  <ElDialog v-model="visible" :title="course ? t('courses.edit') : t('courses.create')" width="640px">
    <ElForm ref="formRef" :model="form" :rules="formRules" label-position="top" class="form-grid">
      <ElFormItem :label="t('fields.name')" prop="name" class="full">
        <ElInput v-model="form.name" maxlength="150" />
      </ElFormItem>
      <ElFormItem :label="t('fields.tuitionFee')" prop="tuitionFee">
        <ElInputNumber v-model="form.tuitionFee" :min="0" :step="100000" controls-position="right" style="width: 100%" />
      </ElFormItem>
      <ElFormItem :label="t('fields.totalSessions')" prop="totalSessions">
        <ElInputNumber v-model="form.totalSessions" :min="1" :max="200" controls-position="right" style="width: 100%" />
      </ElFormItem>
      <ElFormItem :label="t('fields.gradingScheme')" prop="gradingScheme">
        <ElSelect v-model="form.gradingScheme">
          <ElOption v-for="o in options('gradingScheme')" :key="o.value" :value="o.value" :label="o.label" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t('fields.isActive')" prop="isActive">
        <ElSwitch v-model="form.isActive" :active-text="t('common.active')" />
      </ElFormItem>
      <ElFormItem :label="t('fields.description')" prop="description" class="full">
        <ElInput v-model="form.description" type="textarea" :rows="4" maxlength="4000" show-word-limit />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="saving" @click="submit">{{ t('common.save') }}</ElButton>
    </template>
  </ElDialog>
</template>
