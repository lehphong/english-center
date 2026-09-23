<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'

const visible = defineModel<boolean>({ required: true })
const { t } = useI18n()
const api = useApi()
const rules = useFormRules()
const { notifyError } = useApiErrors()

const formRef = ref<FormInstance>()
const saving = ref(false)
const form = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })

const formRules = computed<FormRules>(() => ({
  currentPassword: [rules.required()],
  newPassword: [rules.required(), rules.password()],
  confirmPassword: [
    rules.required(),
    {
      validator: (_rule, value, callback) =>
        value === form.newPassword ? callback() : callback(new Error(t('auth.passwordMismatch'))),
      trigger: 'blur',
    },
  ],
}))

async function submit() {
  if (!(await formRef.value?.validate().catch(() => false))) return
  saving.value = true
  try {
    await api.auth.changePassword(form.currentPassword, form.newPassword)
    ElMessage.success(t('auth.passwordChanged'))
    visible.value = false
  } catch (error) {
    notifyError(error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <ElDialog v-model="visible" :title="t('common.changePassword')" width="420px" @closed="formRef?.resetFields()">
    <ElForm ref="formRef" :model="form" :rules="formRules" label-position="top" @submit.prevent="submit">
      <ElFormItem :label="t('auth.currentPassword')" prop="currentPassword">
        <ElInput v-model="form.currentPassword" type="password" show-password />
      </ElFormItem>
      <ElFormItem :label="t('auth.newPassword')" prop="newPassword">
        <ElInput v-model="form.newPassword" type="password" show-password />
      </ElFormItem>
      <ElFormItem :label="t('auth.confirmPassword')" prop="confirmPassword">
        <ElInput v-model="form.confirmPassword" type="password" show-password />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="saving" @click="submit">{{ t('common.save') }}</ElButton>
    </template>
  </ElDialog>
</template>
