<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { Option, User } from '~/types/api'
import type { UserRole } from '~/types/enums'

const visible = defineModel<boolean>({ required: true })
const props = defineProps<{ user?: User | null }>()
const emit = defineEmits<{ saved: [] }>()

const { t } = useI18n()
const api = useApi()
const rules = useFormRules()
const { options } = useEnumOptions()
const { notifyError } = useApiErrors()

const formRef = ref<FormInstance>()
const saving = ref(false)
const students = ref<Option[]>([])
const form = reactive({
  username: '',
  password: '',
  role: 'Staff' as UserRole,
  isActive: true,
  studentId: null as number | null,
})
const isEdit = computed(() => !!props.user)

watch(visible, async (open) => {
  if (!open) return
  const u = props.user
  Object.assign(form, {
    username: u?.username ?? '',
    password: '',
    role: u?.role ?? 'Staff',
    isActive: u?.isActive ?? true,
    studentId: u?.studentId ?? null,
  })
  nextTick(() => formRef.value?.clearValidate())
  try {
    // Chỉ liệt kê học viên chưa có tài khoản, cộng học viên đang gắn với tài khoản này
    const available = await api.students.options(true)
    students.value = u?.studentId && !available.some((s) => s.id === u.studentId)
      ? [{ id: u.studentId, label: u.studentName ?? String(u.studentId) }, ...available]
      : available
  } catch (error) {
    notifyError(error)
  }
})

const formRules = computed<FormRules>(() => ({
  username: isEdit.value ? [] : [rules.required(), rules.code(), rules.max(50)],
  password: isEdit.value ? [] : [rules.required(), rules.password()],
  role: [rules.required()],
  studentId: form.role === 'Student' ? [rules.required()] : [],
}))

async function submit() {
  if (!(await formRef.value?.validate().catch(() => false))) return
  saving.value = true
  try {
    const studentId = form.role === 'Student' ? form.studentId : null
    if (props.user) {
      await api.users.update(props.user.id, { role: form.role, isActive: form.isActive, studentId })
    } else {
      await api.users.create({ username: form.username, password: form.password, role: form.role, studentId })
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
  <ElDialog v-model="visible" :title="isEdit ? t('users.edit') : t('users.create')" width="480px">
    <ElForm ref="formRef" :model="form" :rules="formRules" label-position="top">
      <ElFormItem :label="t('fields.username')" prop="username">
        <ElInput v-model="form.username" :disabled="isEdit" maxlength="50" autocomplete="off" />
      </ElFormItem>
      <ElFormItem v-if="!isEdit" :label="t('fields.password')" prop="password">
        <ElInput v-model="form.password" type="password" show-password autocomplete="new-password" />
      </ElFormItem>
      <ElFormItem :label="t('fields.role')" prop="role">
        <ElRadioGroup v-model="form.role">
          <ElRadioButton v-for="o in options('role')" :key="o.value" :value="o.value">{{ o.label }}</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem v-if="form.role === 'Student'" :label="t('fields.student')" prop="studentId">
        <ElSelect v-model="form.studentId" filterable :placeholder="t('common.select')">
          <ElOption v-for="s in students" :key="s.id" :value="s.id" :label="s.label" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem v-if="isEdit" :label="t('fields.isActive')">
        <ElSwitch v-model="form.isActive" :active-text="t('common.active')" :inactive-text="t('common.locked')" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="saving" @click="submit">{{ t('common.save') }}</ElButton>
    </template>
  </ElDialog>
</template>
