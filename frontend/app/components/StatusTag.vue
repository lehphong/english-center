<script setup lang="ts">
import type { EnumGroup } from '~/types/enums'

const props = defineProps<{ group: EnumGroup; value: string }>()
const { label } = useEnumOptions()

const colors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
  Paid: 'success',
  Partial: 'warning',
  Unpaid: 'danger',
  Studying: 'primary',
  Deferred: 'warning',
  Completed: 'success',
  Withdrawn: 'info',
  Admin: 'danger',
  Staff: 'primary',
  Student: 'success',
}
</script>

<template>
  <ElTag :type="colors[props.value] ?? 'info'" effect="light" disable-transitions>
    {{ label(props.group, props.value) }}
  </ElTag>
</template>
