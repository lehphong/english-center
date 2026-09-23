<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import type { Student, StudentEnrollment } from '~/types/api'

definePageMeta({ roles: ['Admin', 'Staff'] })

const { t } = useI18n()
const route = useRoute()
const api = useApi()
const { date } = useFormat()
const { label } = useEnumOptions()
const { notifyError } = useApiErrors()

const id = Number(route.params.id)
const student = ref<Student>()
const enrollments = ref<StudentEnrollment[]>([])
const loading = ref(true)
const uploading = ref(false)
const dialogVisible = ref(false)

useHead({ title: () => student.value?.fullName ?? t('nav.students') })

async function load() {
  loading.value = true
  try {
    ;[student.value, enrollments.value] = await Promise.all([api.students.get(id), api.students.enrollments(id)])
  } catch (error) {
    notifyError(error)
  } finally {
    loading.value = false
  }
}

async function uploadAvatar(file: File) {
  uploading.value = true
  try {
    student.value = await api.students.uploadAvatar(id, file)
  } catch (error) {
    notifyError(error)
  } finally {
    uploading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="page">
    <PageHeader :title="student?.fullName ?? ''" :subtitle="student?.code">
      <ElButton :icon="ArrowLeft" @click="navigateTo('/students')">{{ t('common.back') }}</ElButton>
      <ElButton type="primary" @click="dialogVisible = true">{{ t('common.edit') }}</ElButton>
    </PageHeader>

    <ElCard v-if="student" shadow="never">
      <div class="profile">
        <div class="avatar">
          <ElAvatar :src="student.avatarUrl ?? undefined" :size="112">{{ student.fullName.charAt(0) }}</ElAvatar>
          <ImageUploadButton :loading="uploading" @select="uploadAvatar" />
        </div>
        <ElDescriptions :column="2" border class="info">
          <ElDescriptionsItem :label="t('fields.email')">{{ student.email }}</ElDescriptionsItem>
          <ElDescriptionsItem :label="t('fields.phoneNumber')">{{ student.phoneNumber }}</ElDescriptionsItem>
          <ElDescriptionsItem :label="t('fields.dateOfBirth')">{{ date(student.dateOfBirth) }}</ElDescriptionsItem>
          <ElDescriptionsItem :label="t('fields.gender')">{{ label('gender', student.gender) }}</ElDescriptionsItem>
          <ElDescriptionsItem :label="t('fields.entryLevel')">{{ label('englishLevel', student.entryLevel) }}</ElDescriptionsItem>
          <ElDescriptionsItem :label="t('fields.account')">{{ student.username ?? '—' }}</ElDescriptionsItem>
          <ElDescriptionsItem :label="t('fields.address')" :span="2">{{ student.address ?? '—' }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </ElCard>

    <ElCard shadow="never" :header="t('students.enrollments')">
      <ElTable :data="enrollments" :empty-text="t('common.noData')">
        <ElTableColumn :label="t('fields.class')" width="160">
          <template #default="{ row }">
            <NuxtLink :to="`/classes/${row.classId}`">{{ row.classCode }}</NuxtLink>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="className" :label="t('fields.name')" />
        <ElTableColumn prop="courseName" :label="t('fields.course')" />
        <ElTableColumn :label="t('fields.learningStatus')" width="150">
          <template #default="{ row }"><StatusTag group="learningStatus" :value="row.learningStatus" /></template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.paymentStatus')" width="170">
          <template #default="{ row }"><StatusTag group="paymentStatus" :value="row.paymentStatus" /></template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <StudentFormDialog v-model="dialogVisible" :student="student" @saved="load" />
  </div>
</template>

<style scoped>
.profile {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.info {
  flex: 1;
}
</style>
