<script setup lang="ts">
import { Lock, User } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

definePageMeta({ layout: 'auth', public: true })

const { t } = useI18n()
useHead({ title: () => t('auth.title') })

const api = useApi()
const auth = useAuthStore()
const route = useRoute()
const rules = useFormRules()
const { notifyError } = useApiErrors()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: '', password: '' })
const formRules = computed<FormRules>(() => ({ username: [rules.required()], password: [rules.required()] }))

async function submit() {
  if (!(await formRef.value?.validate().catch(() => false))) return
  loading.value = true
  try {
    auth.setSession(await api.auth.login(form.username, form.password))
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : null
    await navigateTo(redirect ?? auth.homePath, { replace: true })
  } catch (error) {
    notifyError(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <ElCard class="login-card" shadow="always">
    <div class="heading">
      <h1>{{ t('app.name') }}</h1>
      <p class="muted">{{ t('auth.subtitle') }}</p>
    </div>
    <ElForm ref="formRef" :model="form" :rules="formRules" size="large" @submit.prevent="submit">
      <ElFormItem prop="username">
        <ElInput v-model="form.username" :placeholder="t('fields.username')" :prefix-icon="User" autocomplete="username" autofocus />
      </ElFormItem>
      <ElFormItem prop="password">
        <ElInput
          v-model="form.password"
          type="password"
          show-password
          :placeholder="t('fields.password')"
          :prefix-icon="Lock"
          autocomplete="current-password"
        />
      </ElFormItem>
      <ElButton type="primary" native-type="submit" :loading="loading" class="submit">{{ t('auth.submit') }}</ElButton>
    </ElForm>
    <div class="footer">
      <LanguageSwitcher />
    </div>
  </ElCard>
</template>

<style scoped>
.login-card {
  width: 100%;
  max-width: 400px;
}

.heading {
  margin-bottom: 24px;
  text-align: center;
}

.heading h1 {
  margin: 0;
  font-size: 24px;
  color: var(--el-color-primary);
}

.submit {
  width: 100%;
}

.footer {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
