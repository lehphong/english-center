<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <!-- Dấu nhận diện: ba bậc ruộng bậc thang, lấy từ bìa design system Hoàng Thổ -->
  <svg :width="size ?? 24" :height="size ?? 24" viewBox="0 0 24 24" aria-hidden="true" class="brand-mark">
    <rect class="t3" x="11" y="4" width="11" height="4" rx="1.5" />
    <rect class="t2" x="6" y="10" width="16" height="4" rx="1.5" />
    <rect class="t1" x="2" y="16" width="20" height="4" rx="1.5" />
  </svg>
</template>

<style scoped>
.brand-mark {
  flex: none;
}

.t1 {
  fill: var(--ochre);
}

.t2 {
  fill: var(--ochre);
  opacity: 0.75;
}

.t3 {
  fill: var(--ochre);
  opacity: 0.5;
}
</style>
