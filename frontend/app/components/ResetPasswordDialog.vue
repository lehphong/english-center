<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { User } from '~/types/api'

const visible = defineModel<boolean>({ required: true })
const props = defineProps<{ user: User | null }>()

const { t } = useI18n()
const api = useApi()
const rules = useFormRules()
const { notifyError } = useApiErrors()

const formRef = ref<FormInstance>()
const saving = ref(false)
const form = reactive({ newPassword: '' })
const formRules = computed<FormRules>(() => ({ newPassword: [rules.required(), rules.password()] }))

async function submit() {
  if (!props.user || !(await formRef.value?.validate().catch(() => false))) return
  saving.value = true
  try {
    await api.users.resetPassword(props.user.id, form.newPassword)
    ElMessage.success(t('common.saved'))
    visible.value = false
  } catch (error) {
    notifyError(error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="t('users.resetFor', { username: user?.username ?? '' })"
    width="420px"
    @closed="formRef?.resetFields()"
  >
    <ElForm ref="formRef" :model="form" :rules="formRules" label-position="top" @submit.prevent="submit">
      <ElFormItem :label="t('fields.newPassword')" prop="newPassword">
        <ElInput v-model="form.newPassword" type="password" show-password autocomplete="new-password" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="saving" @click="submit">{{ t('common.save') }}</ElButton>
    </template>
  </ElDialog>
</template>
