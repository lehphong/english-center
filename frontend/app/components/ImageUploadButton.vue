<script setup lang="ts">
import type { UploadRawFile } from 'element-plus'

const emit = defineEmits<{ select: [file: File] }>()
defineProps<{ loading?: boolean; hideHint?: boolean }>()
const { t } = useI18n()

const MAX_BYTES = 2 * 1024 * 1024
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp']

// Kiểm tra trước ở trình duyệt; backend vẫn kiểm tra lại
function beforeUpload(file: UploadRawFile) {
  if (!ACCEPT.includes(file.type)) {
    ElMessage.error(t('validation.file.invalidType'))
  } else if (file.size > MAX_BYTES) {
    ElMessage.error(t('validation.file.tooLarge'))
  } else {
    emit('select', file)
  }
  return false
}
</script>

<template>
  <ElUpload :show-file-list="false" :before-upload="beforeUpload" :accept="ACCEPT.join(',')">
    <ElButton :loading="loading">{{ t('common.upload') }}</ElButton>
    <template v-if="!hideHint" #tip>
      <div class="muted">{{ t('common.uploadHint') }}</div>
    </template>
  </ElUpload>
</template>
