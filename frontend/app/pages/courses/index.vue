<script setup lang="ts">
import { Plus, Search } from '@element-plus/icons-vue'
import type { Course, CourseQuery } from '~/types/api'

definePageMeta({ roles: ['Admin', 'Staff'] })

const { t } = useI18n()
useHead({ title: () => t('nav.courses') })

const api = useApi()
const { money } = useFormat()
const { options } = useEnumOptions()
const { confirmDelete } = useConfirm()
const { notifyError } = useApiErrors()

const { query, items, total, loading, load, search } = usePagedList((q) => api.courses.list(q), {
  search: '',
  isActive: undefined,
  gradingScheme: undefined,
} as CourseQuery)

const dialogVisible = ref(false)
const editing = ref<Course | null>(null)
const uploadingId = ref<number | null>(null)

function openCreate() {
  editing.value = null
  dialogVisible.value = true
}

function openEdit(course: Course) {
  editing.value = course
  dialogVisible.value = true
}

async function uploadThumbnail(course: Course, file: File) {
  uploadingId.value = course.id
  try {
    await api.courses.uploadThumbnail(course.id, file)
    await load()
  } catch (error) {
    notifyError(error)
  } finally {
    uploadingId.value = null
  }
}

async function remove(course: Course) {
  if (!(await confirmDelete(course.name))) return
  try {
    await api.courses.remove(course.id)
    ElMessage.success(t('common.deleted'))
    await load()
  } catch (error) {
    notifyError(error)
  }
}
</script>

<template>
  <div class="page">
    <PageHeader :title="t('courses.title')">
      <ElButton type="primary" :icon="Plus" @click="openCreate">{{ t('courses.create') }}</ElButton>
    </PageHeader>

    <ElCard shadow="never">
      <div class="toolbar">
        <ElInput v-model="query.search" :placeholder="t('common.searchPlaceholder')" :aria-label="t('common.searchPlaceholder')" :prefix-icon="Search" clearable @keyup.enter="search" @clear="search" />
        <ElSelect v-model="query.gradingScheme" :placeholder="t('fields.gradingScheme')" :aria-label="t('fields.gradingScheme')" clearable @change="search">
          <ElOption v-for="o in options('gradingScheme')" :key="o.value" :value="o.value" :label="o.label" />
        </ElSelect>
        <ElSelect v-model="query.isActive" :placeholder="t('fields.isActive')" :aria-label="t('fields.isActive')" clearable @change="search">
          <ElOption :value="true" :label="t('common.active')" />
          <ElOption :value="false" :label="t('common.inactive')" />
        </ElSelect>
        <ElButton type="primary" plain @click="search">{{ t('common.search') }}</ElButton>
      </div>

      <ElTable v-loading="loading" :data="items" :empty-text="t('common.noData')" style="margin-top: 16px">
        <ElTableColumn width="96">
          <template #header><span class="visually-hidden">{{ t('fields.thumbnail') }}</span></template>
          <template #default="{ row }">
            <ElImage v-if="row.thumbnailUrl" :src="row.thumbnailUrl" fit="cover" class="thumb" />
            <div v-else class="thumb placeholder" />
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.name')" min-width="220">
          <template #default="{ row }">
            <strong>{{ row.name }}</strong>
            <div class="muted">{{ row.description }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.gradingScheme')" width="130">
          <template #default="{ row }">{{ options('gradingScheme').find((o) => o.value === row.gradingScheme)?.label }}</template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.tuitionFee')" width="150" align="right">
          <template #default="{ row }"><span class="num">{{ money(row.tuitionFee) }}</span></template>
        </ElTableColumn>
        <ElTableColumn prop="totalSessions" :label="t('fields.totalSessions')" width="150" align="center" />
        <ElTableColumn prop="classCount" :label="t('fields.classCount')" width="110" align="center" />
        <ElTableColumn :label="t('fields.isActive')" width="160">
          <template #default="{ row }">
            <StatusTag :tone="row.isActive ? 'success' : 'neutral'" :label="row.isActive ? t('common.active') : t('common.inactive')" />
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('common.actions')" width="260" fixed="right">
          <template #default="{ row }">
            <div class="row-actions">
              <ImageUploadButton hide-hint :title="t('common.uploadHint')" :loading="uploadingId === row.id" @select="(file) => uploadThumbnail(row as Course, file)" />
              <ElButton link type="primary" @click="openEdit(row as Course)">{{ t('common.edit') }}</ElButton>
              <ElButton link type="danger" @click="remove(row as Course)">{{ t('common.delete') }}</ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>

      <ListPagination v-model:page="query.page" v-model:page-size="query.pageSize" :total="total" @change="load" />
    </ElCard>

    <CourseFormDialog v-model="dialogVisible" :course="editing" @saved="load" />
  </div>
</template>

<style scoped>
.thumb {
  width: 72px;
  height: 48px;
  border-radius: 6px;
}

.placeholder {
  background: var(--el-fill-color-light);
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
