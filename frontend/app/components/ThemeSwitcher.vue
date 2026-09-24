<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue'

const { t } = useI18n()
const { theme, toggle } = useTheme()
const label = computed(() => (theme.value === 'dark' ? t('common.lightMode') : t('common.darkMode')))
</script>

<template>
  <ElTooltip :content="label" placement="bottom">
    <ElButton circle :icon="theme === 'dark' ? Sunny : Moon" :aria-label="label" @click="toggle" />
  </ElTooltip>
</template>
