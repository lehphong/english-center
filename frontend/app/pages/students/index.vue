<script setup lang="ts">
import { Plus, Search } from '@element-plus/icons-vue'
import type { Student, StudentQuery } from '~/types/api'

definePageMeta({ roles: ['Admin', 'Staff'] })

const { t } = useI18n()
useHead({ title: () => t('nav.students') })

const api = useApi()
const { date } = useFormat()
const { options, label } = useEnumOptions()
const { confirmDelete } = useConfirm()
const { notifyError } = useApiErrors()

const { query, items, total, loading, load, search } = usePagedList((q) => api.students.list(q), {
  search: '',
  entryLevel: undefined,
  hasAccount: undefined,
} as StudentQuery)

const dialogVisible = ref(false)
const editing = ref<Student | null>(null)

function openForm(student: Student | null) {
  editing.value = student
  dialogVisible.value = true
}

async function remove(student: Student) {
  if (!(await confirmDelete(student.fullName))) return
  try {
    await api.students.remove(student.id)
    ElMessage.success(t('common.deleted'))
    await load()
  } catch (error) {
    notifyError(error)
  }
}
</script>

<template>
  <div class="page">
    <PageHeader :title="t('students.title')">
      <ElButton type="primary" :icon="Plus" @click="openForm(null)">{{ t('students.create') }}</ElButton>
    </PageHeader>

    <ElCard shadow="never">
      <div class="toolbar">
        <ElInput v-model="query.search" :placeholder="t('common.searchPlaceholder')" :aria-label="t('common.searchPlaceholder')" :prefix-icon="Search" clearable @keyup.enter="search" @clear="search" />
        <ElSelect v-model="query.entryLevel" :placeholder="t('fields.entryLevel')" :aria-label="t('fields.entryLevel')" clearable @change="search">
          <ElOption v-for="o in options('englishLevel')" :key="o.value" :value="o.value" :label="o.label" />
        </ElSelect>
        <ElSelect v-model="query.hasAccount" :placeholder="t('fields.account')" :aria-label="t('fields.account')" clearable @change="search">
          <ElOption :value="true" :label="t('students.hasAccount')" />
          <ElOption :value="false" :label="t('students.noAccount')" />
        </ElSelect>
        <ElButton type="primary" plain @click="search">{{ t('common.search') }}</ElButton>
      </div>

      <ElTable v-loading="loading" :data="items" :empty-text="t('common.noData')" style="margin-top: 16px">
        <ElTableColumn width="64">
          <template #header><span class="visually-hidden">{{ t('fields.avatar') }}</span></template>
          <template #default="{ row }">
            <ElAvatar :src="row.avatarUrl ?? undefined" :size="36">{{ row.fullName.charAt(0) }}</ElAvatar>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.fullName')" min-width="200">
          <template #default="{ row }">
            <NuxtLink :to="`/students/${row.id}`"><strong>{{ row.fullName }}</strong></NuxtLink>
            <div class="muted">{{ row.code }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.email')" min-width="210">
          <template #default="{ row }">
            {{ row.email }}
            <div class="muted">{{ row.phoneNumber }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.dateOfBirth')" width="150">
          <template #default="{ row }">{{ date(row.dateOfBirth) }}</template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.entryLevel')" width="140">
          <template #default="{ row }">{{ label('englishLevel', row.entryLevel) }}</template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.account')" width="130">
          <template #default="{ row }">
            <span v-if="row.username" class="code">{{ row.username }}</span>
            <span v-else class="muted">—</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="enrollmentCount" :label="t('fields.classCount')" width="110" align="center" />
        <ElTableColumn :label="t('common.actions')" width="150" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" @click="openForm(row as Student)">{{ t('common.edit') }}</ElButton>
            <ElButton link type="danger" @click="remove(row as Student)">{{ t('common.delete') }}</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <ListPagination v-model:page="query.page" v-model:page-size="query.pageSize" :total="total" @change="load" />
    </ElCard>

    <StudentFormDialog v-model="dialogVisible" :student="editing" @saved="load" />
  </div>
</template>
