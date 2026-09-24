<script setup lang="ts">
const emit = defineEmits<{ select: [file: File] }>()
defineProps<{ loading?: boolean; hideHint?: boolean }>()
const { t } = useI18n()

const MAX_BYTES = 2 * 1024 * 1024
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp']
const input = ref<HTMLInputElement>()

// Kiểm tra trước ở trình duyệt; backend vẫn kiểm tra lại
function onChange() {
  const file = input.value?.files?.[0]
  if (!file) return
  if (!ACCEPT.includes(file.type)) {
    ElMessage.error(t('validation.file.invalidType'))
  } else if (file.size > MAX_BYTES) {
    ElMessage.error(t('validation.file.tooLarge'))
  } else {
    emit('select', file)
  }
  // Cho phép chọn lại đúng file vừa chọn
  input.value!.value = ''
}
</script>

<template>
  <div>
    <!-- Một nút duy nhất mở hộp chọn file (ElUpload lồng nút trong một role="button" khác) -->
    <input
      ref="input"
      type="file"
      class="visually-hidden"
      tabindex="-1"
      aria-hidden="true"
      :accept="ACCEPT.join(',')"
      @change="onChange"
    >
    <ElButton :loading="loading" @click="input?.click()">{{ t('common.upload') }}</ElButton>
    <div v-if="!hideHint" class="muted hint">{{ t('common.uploadHint') }}</div>
  </div>
</template>

<style scoped>
.hint {
  margin-top: var(--space-1);
  font-size: 12px;
}
</style>
