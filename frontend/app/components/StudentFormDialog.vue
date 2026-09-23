<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { CreateStudent, Student } from '~/types/api'

const visible = defineModel<boolean>({ required: true })
const props = defineProps<{ student?: Student | null }>()
const emit = defineEmits<{ saved: [student: Student] }>()

const { t } = useI18n()
const api = useApi()
const rules = useFormRules()
const { options } = useEnumOptions()
const { notifyError } = useApiErrors()

const formRef = ref<FormInstance>()
const saving = ref(false)
const empty = (): CreateStudent => ({
  code: '',
  fullName: '',
  dateOfBirth: null,
  gender: 'Male',
  email: '',
  phoneNumber: '',
  address: null,
  entryLevel: 'Beginner',
  createAccount: false,
  username: null,
  password: null,
})
const form = reactive<CreateStudent>(empty())
const isEdit = computed(() => !!props.student)

watch(visible, (open) => {
  if (!open) return
  Object.assign(form, empty(), props.student ?? {})
  nextTick(() => formRef.value?.clearValidate())
})

const formRules = computed<FormRules>(() => ({
  code: [rules.required(), rules.max(20), rules.code()],
  fullName: [rules.required(), rules.max(100)],
  email: [rules.required(), rules.email(), rules.max(150)],
  phoneNumber: [rules.required(), rules.phone()],
  address: [rules.max(250)],
  username: [rules.code(), rules.max(50)],
  password: form.createAccount ? [rules.required(), rules.password()] : [],
}))

async function submit() {
  if (!(await formRef.value?.validate().catch(() => false))) return
  saving.value = true
  try {
    const { createAccount, username, password, ...student } = form
    const saved = props.student
      ? await api.students.update(props.student.id, student)
      : await api.students.create({ ...student, createAccount, username: username || null, password })
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
  <ElDialog v-model="visible" :title="isEdit ? t('students.edit') : t('students.create')" width="680px">
    <ElForm ref="formRef" :model="form" :rules="formRules" label-position="top" class="form-grid">
      <ElFormItem :label="t('fields.code')" prop="code">
        <ElInput v-model="form.code" maxlength="20" />
      </ElFormItem>
      <ElFormItem :label="t('fields.fullName')" prop="fullName">
        <ElInput v-model="form.fullName" maxlength="100" />
      </ElFormItem>
      <ElFormItem :label="t('fields.email')" prop="email">
        <ElInput v-model="form.email" type="email" maxlength="150" />
      </ElFormItem>
      <ElFormItem :label="t('fields.phoneNumber')" prop="phoneNumber">
        <ElInput v-model="form.phoneNumber" maxlength="10" />
      </ElFormItem>
      <ElFormItem :label="t('fields.dateOfBirth')" prop="dateOfBirth">
        <ElDatePicker
          v-model="form.dateOfBirth"
          type="date"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :disabled-date="(d: Date) => d > new Date()"
        />
      </ElFormItem>
      <ElFormItem :label="t('fields.gender')" prop="gender">
        <ElRadioGroup v-model="form.gender">
          <ElRadio v-for="o in options('gender')" :key="o.value" :value="o.value">{{ o.label }}</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem :label="t('fields.entryLevel')" prop="entryLevel">
        <ElSelect v-model="form.entryLevel">
          <ElOption v-for="o in options('englishLevel')" :key="o.value" :value="o.value" :label="o.label" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t('fields.address')" prop="address">
        <ElInput v-model="form.address" maxlength="250" />
      </ElFormItem>

      <template v-if="!isEdit">
        <ElFormItem class="full">
          <ElCheckbox v-model="form.createAccount">{{ t('fields.createAccount') }}</ElCheckbox>
        </ElFormItem>
        <template v-if="form.createAccount">
          <ElFormItem :label="t('fields.username')" prop="username">
            <ElInput v-model="form.username" :placeholder="t('students.usernameHint')" maxlength="50" />
          </ElFormItem>
          <ElFormItem :label="t('fields.password')" prop="password">
            <ElInput v-model="form.password" type="password" show-password autocomplete="new-password" />
          </ElFormItem>
        </template>
      </template>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="saving" @click="submit">{{ t('common.save') }}</ElButton>
    </template>
  </ElDialog>
</template>
