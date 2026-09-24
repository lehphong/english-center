<script setup lang="ts">
import { Plus, Search } from '@element-plus/icons-vue'
import type { Enrollment, EnrollmentQuery, Option } from '~/types/api'

definePageMeta({ roles: ['Admin', 'Staff'] })

const { t } = useI18n()
useHead({ title: () => t('nav.enrollments') })

const api = useApi()
const route = useRoute()
const { money, date } = useFormat()
const { options } = useEnumOptions()
const { confirmDelete } = useConfirm()
const { notifyError } = useApiErrors()

const classes = ref<Option[]>([])
const { query, items, total, loading, load, search } = usePagedList((q) => api.enrollments.list(q), {
  search: '',
  classId: route.query.classId ? Number(route.query.classId) : undefined,
  paymentStatus: undefined,
  learningStatus: undefined,
} as EnrollmentQuery)

onMounted(async () => {
  classes.value = await api.classes.options().catch(() => [])
})

const dialogVisible = ref(false)
const editing = ref<Enrollment | null>(null)

function openForm(enrollment: Enrollment | null) {
  editing.value = enrollment
  dialogVisible.value = true
}

async function remove(enrollment: Enrollment) {
  if (!(await confirmDelete(`${enrollment.studentName} · ${enrollment.classCode}`))) return
  try {
    await api.enrollments.remove(enrollment.id)
    ElMessage.success(t('common.deleted'))
    await load()
  } catch (error) {
    notifyError(error)
  }
}
</script>

<template>
  <div class="page">
    <PageHeader :title="t('enrollments.title')">
      <ElButton type="primary" :icon="Plus" @click="openForm(null)">{{ t('enrollments.create') }}</ElButton>
    </PageHeader>

    <ElCard shadow="never">
      <div class="toolbar">
        <ElInput v-model="query.search" :placeholder="t('common.searchPlaceholder')" :aria-label="t('common.searchPlaceholder')" :prefix-icon="Search" clearable @keyup.enter="search" @clear="search" />
        <ElSelect v-model="query.classId" :placeholder="t('fields.class')" :aria-label="t('fields.class')" clearable filterable @change="search">
          <ElOption v-for="c in classes" :key="c.id" :value="c.id" :label="c.label" />
        </ElSelect>
        <ElSelect v-model="query.paymentStatus" :placeholder="t('fields.paymentStatus')" :aria-label="t('fields.paymentStatus')" clearable @change="search">
          <ElOption v-for="o in options('paymentStatus')" :key="o.value" :value="o.value" :label="o.label" />
        </ElSelect>
        <ElSelect v-model="query.learningStatus" :placeholder="t('fields.learningStatus')" :aria-label="t('fields.learningStatus')" clearable @change="search">
          <ElOption v-for="o in options('learningStatus')" :key="o.value" :value="o.value" :label="o.label" />
        </ElSelect>
      </div>

      <ElTable v-loading="loading" :data="items" :empty-text="t('common.noData')" style="margin-top: 16px">
        <ElTableColumn :label="t('fields.student')" min-width="190">
          <template #default="{ row }">
            <NuxtLink :to="`/students/${row.studentId}`"><strong>{{ row.studentName }}</strong></NuxtLink>
            <div class="muted">{{ row.studentCode }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.class')" min-width="190">
          <template #default="{ row }">
            <NuxtLink :to="`/classes/${row.classId}`">{{ row.classCode }}</NuxtLink>
            <div class="muted">{{ row.courseName }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.enrolledOn')" width="120">
          <template #default="{ row }">{{ date(row.enrolledOn) }}</template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.tuitionFee')" width="140" align="right">
          <template #default="{ row }"><span class="num">{{ money(row.tuitionFee) }}</span></template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.balance')" width="140" align="right">
          <template #default="{ row }">
            <span class="num" :class="{ debt: row.balance > 0 }">{{ money(row.balance) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.paymentStatus')" width="160">
          <template #default="{ row }"><StatusTag group="paymentStatus" :value="row.paymentStatus" /></template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.learningStatus')" width="130">
          <template #default="{ row }"><StatusTag group="learningStatus" :value="row.learningStatus" /></template>
        </ElTableColumn>
        <ElTableColumn :label="t('common.actions')" width="140" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" @click="openForm(row as Enrollment)">{{ t('common.edit') }}</ElButton>
            <ElButton link type="danger" @click="remove(row as Enrollment)">{{ t('common.delete') }}</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <ListPagination v-model:page="query.page" v-model:page-size="query.pageSize" :total="total" @change="load" />
    </ElCard>

    <EnrollmentFormDialog v-model="dialogVisible" :enrollment="editing" @saved="load" />
  </div>
</template>

<style scoped>
/* Số tiền không mang màu: trạng thái nằm ở cột "Tình trạng học phí" */
.debt {
  font-weight: 600;
}
</style>
