<script setup lang="ts">
/** Thẻ chỉ số (design system Hoàng Thổ): nhãn → con số → chú thích. Mỗi màn hình chỉ một thẻ `accent`. */
defineProps<{ label: string; value: string | number; accent?: boolean; hint?: string }>()
</script>

<template>
  <div class="stat">
    <span class="label">{{ label }}</span>
    <span class="value" :class="{ accent }">{{ value }}</span>
    <span v-if="hint || $slots.default" class="hint">
      <slot>{{ hint }}</slot>
    </span>
  </div>
</template>

<style scoped>
/* Nổi trên nền bằng shadow-raised, không viền */
.stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-raised);
}

.value {
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 500;
  line-height: 34px;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}

.value.accent {
  color: var(--ochre-ink);
}

.hint {
  font-size: 12px;
  line-height: 18px;
  color: var(--ink-muted);
}
</style>
