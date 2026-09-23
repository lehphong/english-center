<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()
const is404 = computed(() => props.error.statusCode === 404)
</script>

<template>
  <div class="error-page">
    <ElResult :icon="is404 ? 'info' : 'error'" :title="String(error.statusCode)" :sub-title="is404 ? t('common.notFound') : error.message">
      <template #extra>
        <ElButton type="primary" @click="clearError({ redirect: '/' })">{{ t('common.goHome') }}</ElButton>
      </template>
    </ElResult>
  </div>
</template>

<style scoped>
.error-page {
  display: grid;
  place-items: center;
  min-height: 100vh;
}
</style>
