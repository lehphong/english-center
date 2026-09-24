<script setup lang="ts">
import en from 'element-plus/es/locale/lang/en'
import vi from 'element-plus/es/locale/lang/vi'

const { locale, t } = useI18n()
const { theme } = useTheme()
const elementLocale = computed(() => (locale.value === 'en' ? en : vi))

useHead({
  htmlAttrs: { lang: locale, class: computed(() => (theme.value === 'dark' ? 'dark' : '')) },
  titleTemplate: (title) => (title ? `${title} · ${t('app.name')}` : t('app.name')),
})
</script>

<template>
  <ElConfigProvider :locale="elementLocale">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </ElConfigProvider>
</template>
