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
  <section class="login">
    <div class="heading">
      <h1>{{ t('auth.title') }}</h1>
      <p class="muted">{{ t('auth.subtitle') }}</p>
    </div>
    <ElForm ref="formRef" :model="form" :rules="formRules" label-position="top" size="large" @submit.prevent="submit">
      <ElFormItem :label="t('fields.username')" prop="username">
        <ElInput id="username" v-model="form.username" :prefix-icon="User" autocomplete="username" autofocus />
      </ElFormItem>
      <ElFormItem :label="t('fields.password')" prop="password">
        <ElInput
          id="password"
          v-model="form.password"
          type="password"
          show-password
          :prefix-icon="Lock"
          autocomplete="current-password"
        />
      </ElFormItem>
      <ElButton type="primary" native-type="submit" :loading="loading" class="submit">{{ t('auth.submit') }}</ElButton>
    </ElForm>
    <div class="footer">
      <ThemeSwitcher />
      <LanguageSwitcher />
    </div>
  </section>
</template>

<style scoped>
.login {
  width: 100%;
  max-width: 380px;
  padding: var(--space-6);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
}

.heading {
  margin-bottom: var(--space-5);
}

.heading h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  line-height: 30px;
}

.heading p {
  margin: var(--space-1) 0 0;
}

.submit {
  width: 100%;
  margin-top: var(--space-2);
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-5);
}
</style>
