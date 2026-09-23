<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const { t } = useI18n()
const auth = useAuthStore()
</script>

<template>
  <ElCard>
    <ElResult icon="warning" title="403" :sub-title="t('common.forbidden')">
      <template #extra>
        <ElButton type="primary" @click="navigateTo(auth.homePath)">{{ t('common.goHome') }}</ElButton>
      </template>
    </ElResult>
  </ElCard>
</template>
