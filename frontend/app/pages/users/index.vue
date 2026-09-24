<script setup lang="ts">
import { Plus, Search } from '@element-plus/icons-vue'
import type { User, UserQuery } from '~/types/api'

definePageMeta({ roles: ['Admin'] })

const { t } = useI18n()
useHead({ title: () => t('nav.users') })

const api = useApi()
const auth = useAuthStore()
const { dateTime } = useFormat()
const { options } = useEnumOptions()
const { confirmDelete } = useConfirm()
const { notifyError } = useApiErrors()

const { query, items, total, loading, load, search } = usePagedList((q) => api.users.list(q), {
  search: '',
  role: undefined,
  isActive: undefined,
} as UserQuery)

const formVisible = ref(false)
const resetVisible = ref(false)
const selected = ref<User | null>(null)

function openForm(user: User | null) {
  selected.value = user
  formVisible.value = true
}

function openReset(user: User) {
  selected.value = user
  resetVisible.value = true
}

async function remove(user: User) {
  if (!(await confirmDelete(user.username))) return
  try {
    await api.users.remove(user.id)
    ElMessage.success(t('common.deleted'))
    await load()
  } catch (error) {
    notifyError(error)
  }
}
</script>

<template>
  <div class="page">
    <PageHeader :title="t('users.title')">
      <ElButton type="primary" :icon="Plus" @click="openForm(null)">{{ t('users.create') }}</ElButton>
    </PageHeader>

    <ElCard shadow="never">
      <div class="toolbar">
        <ElInput v-model="query.search" :placeholder="t('common.searchPlaceholder')" :aria-label="t('common.searchPlaceholder')" :prefix-icon="Search" clearable @keyup.enter="search" @clear="search" />
        <ElSelect v-model="query.role" :placeholder="t('fields.role')" :aria-label="t('fields.role')" clearable @change="search">
          <ElOption v-for="o in options('role')" :key="o.value" :value="o.value" :label="o.label" />
        </ElSelect>
        <ElSelect v-model="query.isActive" :placeholder="t('fields.isActive')" :aria-label="t('fields.isActive')" clearable @change="search">
          <ElOption :value="true" :label="t('common.active')" />
          <ElOption :value="false" :label="t('common.locked')" />
        </ElSelect>
      </div>

      <ElTable v-loading="loading" :data="items" :empty-text="t('common.noData')" style="margin-top: 16px">
        <ElTableColumn :label="t('fields.username')" min-width="160">
          <template #default="{ row }"><strong>{{ row.username }}</strong></template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.role')" width="150">
          <template #default="{ row }"><StatusTag group="role" :value="row.role" /></template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.student')" min-width="180">
          <template #default="{ row }">
            <NuxtLink v-if="row.studentId" :to="`/students/${row.studentId}`">{{ row.studentName }}</NuxtLink>
            <span v-else class="muted">—</span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.isActive')" width="160">
          <template #default="{ row }">
            <StatusTag :tone="row.isActive ? 'success' : 'neutral'" :label="row.isActive ? t('common.active') : t('common.locked')" />
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.lastLoginAt')" width="170">
          <template #default="{ row }">{{ dateTime(row.lastLoginAt) }}</template>
        </ElTableColumn>
        <ElTableColumn :label="t('common.actions')" width="240" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" @click="openForm(row as User)">{{ t('common.edit') }}</ElButton>
            <ElButton link type="warning" @click="openReset(row as User)">{{ t('common.resetPassword') }}</ElButton>
            <ElButton link type="danger" :disabled="row.id === auth.user?.id" @click="remove(row as User)">{{ t('common.delete') }}</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <ListPagination v-model:page="query.page" v-model:page-size="query.pageSize" :total="total" @change="load" />
    </ElCard>

    <UserFormDialog v-model="formVisible" :user="selected" @saved="load" />
    <ResetPasswordDialog v-model="resetVisible" :user="selected" />
  </div>
</template>
