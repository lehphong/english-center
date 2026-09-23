<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
</script>

<template>
  <ElSelect
    :model-value="locale"
    size="small"
    style="width: 120px"
    @update:model-value="(code: 'vi' | 'en') => setLocale(code)"
  >
    <ElOption v-for="item in locales" :key="item.code" :value="item.code" :label="item.name ?? item.code" />
  </ElSelect>
</template>
