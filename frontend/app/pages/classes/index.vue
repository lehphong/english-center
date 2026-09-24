<script setup lang="ts">
import { Plus, Search } from '@element-plus/icons-vue'
import type { ClassQuery, CourseClass, Option } from '~/types/api'

definePageMeta({ roles: ['Admin', 'Staff'] })

const { t } = useI18n()
useHead({ title: () => t('nav.classes') })

const api = useApi()
const { date } = useFormat()
const { confirmDelete } = useConfirm()
const { notifyError } = useApiErrors()

const courses = ref<Option[]>([])
const { query, items, total, loading, load, search } = usePagedList((q) => api.classes.list(q), {
  search: '',
  courseId: undefined,
} as ClassQuery)

onMounted(async () => {
  courses.value = await api.courses.options().catch(() => [])
})

const dialogVisible = ref(false)
const editing = ref<CourseClass | null>(null)

function openForm(courseClass: CourseClass | null) {
  editing.value = courseClass
  dialogVisible.value = true
}

async function remove(courseClass: CourseClass) {
  if (!(await confirmDelete(courseClass.code))) return
  try {
    await api.classes.remove(courseClass.id)
    ElMessage.success(t('common.deleted'))
    await load()
  } catch (error) {
    notifyError(error)
  }
}
</script>

<template>
  <div class="page">
    <PageHeader :title="t('classes.title')">
      <ElButton type="primary" :icon="Plus" @click="openForm(null)">{{ t('classes.create') }}</ElButton>
    </PageHeader>

    <ElCard shadow="never">
      <div class="toolbar">
        <ElInput v-model="query.search" :placeholder="t('common.searchPlaceholder')" :aria-label="t('common.searchPlaceholder')" :prefix-icon="Search" clearable @keyup.enter="search" @clear="search" />
        <ElSelect v-model="query.courseId" :placeholder="t('fields.course')" :aria-label="t('fields.course')" clearable filterable @change="search">
          <ElOption v-for="c in courses" :key="c.id" :value="c.id" :label="c.label" />
        </ElSelect>
        <ElButton type="primary" plain @click="search">{{ t('common.search') }}</ElButton>
      </div>

      <ElTable v-loading="loading" :data="items" :empty-text="t('common.noData')" style="margin-top: 16px">
        <ElTableColumn :label="t('fields.code')" width="140">
          <template #default="{ row }">
            <NuxtLink :to="`/classes/${row.id}`"><strong>{{ row.code }}</strong></NuxtLink>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.name')" min-width="200">
          <template #default="{ row }">
            {{ row.name }}
            <div class="muted">{{ row.courseName }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="teacherName" :label="t('fields.teacherName')" width="170" />
        <ElTableColumn :label="t('fields.schedule')" min-width="180">
          <template #default="{ row }">
            {{ row.schedule }}
            <div class="muted">{{ row.room }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.startDate')" width="130">
          <template #default="{ row }">{{ date(row.startDate) }}</template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.enrolled')" width="110" align="center">
          <template #default="{ row }">
            <StatusTag v-if="row.enrolledCount >= row.maxCapacity" tone="danger" :label="`${row.enrolledCount}/${row.maxCapacity}`" />
            <span v-else class="num">{{ row.enrolledCount }}/{{ row.maxCapacity }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('common.actions')" width="200" fixed="right">
          <template #default="{ row }">
            <NuxtLink :to="`/classes/${row.id}`"><ElButton link type="primary">{{ t('common.details') }}</ElButton></NuxtLink>
            <ElButton link type="primary" @click="openForm(row as CourseClass)">{{ t('common.edit') }}</ElButton>
            <ElButton link type="danger" @click="remove(row as CourseClass)">{{ t('common.delete') }}</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <ListPagination v-model:page="query.page" v-model:page-size="query.pageSize" :total="total" @change="load" />
    </ElCard>

    <ClassFormDialog v-model="dialogVisible" :course-class="editing" @saved="load" />
  </div>
</template>
