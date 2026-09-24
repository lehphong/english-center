<script setup lang="ts">
const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })
defineProps<{ total: number }>()
const emit = defineEmits<{ change: [] }>()
const { t, locale } = useI18n()

// ElPagination không có prop đặt nhãn cho ô chọn số dòng mỗi trang → gắn aria-label sau khi render
const root = ref<HTMLElement>()
function labelPageSize() {
  root.value?.querySelector('.el-pagination__sizes input')?.setAttribute('aria-label', t('common.pageSize'))
}
onMounted(labelPageSize)
watch(locale, () => nextTick(labelPageSize))
</script>

<template>
  <div ref="root" class="pagination">
    <ElPagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      layout="total, sizes, prev, pager, next"
      :total="total"
      @change="emit('change')"
    />
  </div>
</template>
