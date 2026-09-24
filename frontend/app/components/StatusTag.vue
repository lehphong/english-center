<script setup lang="ts">
import type { EnumGroup } from '~/types/enums'

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

/**
 * StatusTag của design system Hoàng Thổ: màu + hình + chữ, không bao giờ chỉ dựa vào màu.
 * Dùng theo enum (`group` + `value`) hoặc trực tiếp (`tone` + `label`).
 */
const props = defineProps<{ group?: EnumGroup; value?: string; tone?: Tone; label?: string }>()
const { label: enumLabel } = useEnumOptions()

// Một trạng thái — một tone, ở mọi màn hình
const TONES: Record<string, Tone> = {
  Paid: 'success',
  Completed: 'success',
  Partial: 'warning',
  Deferred: 'warning',
  Unpaid: 'danger',
  Studying: 'info',
  Withdrawn: 'neutral',
}

const tone = computed<Tone>(() => props.tone ?? TONES[props.value ?? ''] ?? 'neutral')
const text = computed(() => props.label ?? (props.group ? enumLabel(props.group, props.value) : props.value))
</script>

<template>
  <span class="ht-tag" :class="`ht-tag--${tone}`">{{ text }}</span>
</template>

<style scoped>
.ht-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  white-space: nowrap;
  background: var(--surface-sunken);
  color: var(--ink-muted);
}

/* Hình dạng riêng cho từng tone: tròn / tam giác / vuông / thoi / gạch */
.ht-tag::before {
  content: '';
  flex: none;
  width: 8px;
  height: 8px;
  background: currentColor;
}

.ht-tag--success {
  background: var(--success-soft);
  color: var(--success);
}

.ht-tag--success::before {
  border-radius: 50%;
}

.ht-tag--warning {
  background: var(--warning-soft);
  color: var(--warning);
}

.ht-tag--warning::before {
  width: 9px;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}

.ht-tag--danger {
  background: var(--danger-soft);
  color: var(--danger);
}

.ht-tag--danger::before {
  border-radius: 1px;
}

.ht-tag--info {
  background: var(--info-soft);
  color: var(--info);
}

.ht-tag--info::before {
  transform: rotate(45deg) scale(0.85);
}

.ht-tag--neutral::before {
  height: 2px;
}
</style>
