<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import type { ClassStudent, CourseClass } from '~/types/api'

definePageMeta({ roles: ['Admin', 'Staff'] })

const { t } = useI18n()
const route = useRoute()
const api = useApi()
const { date } = useFormat()
const { notifyError } = useApiErrors()

const id = Number(route.params.id)
const courseClass = ref<CourseClass>()
const students = ref<ClassStudent[]>([])
const loading = ref(true)
const dialogVisible = ref(false)

useHead({ title: () => courseClass.value?.code ?? t('nav.classes') })

async function load() {
  loading.value = true
  try {
    ;[courseClass.value, students.value] = await Promise.all([api.classes.get(id), api.classes.students(id)])
  } catch (error) {
    notifyError(error)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="page">
    <PageHeader :title="courseClass ? `${courseClass.code} · ${courseClass.name}` : ''" :subtitle="courseClass?.courseName">
      <ElButton :icon="ArrowLeft" @click="navigateTo('/classes')">{{ t('common.back') }}</ElButton>
      <ElButton type="primary" @click="dialogVisible = true">{{ t('common.edit') }}</ElButton>
    </PageHeader>

    <ElCard v-if="courseClass" shadow="never">
      <ElDescriptions :column="3" border>
        <ElDescriptionsItem :label="t('fields.teacherName')">{{ courseClass.teacherName ?? '—' }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('fields.schedule')">{{ courseClass.schedule ?? '—' }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('fields.room')">{{ courseClass.room ?? '—' }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('fields.startDate')">{{ date(courseClass.startDate) }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('fields.endDate')">{{ date(courseClass.endDate) }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('fields.enrolled')">{{ courseClass.enrolledCount }}/{{ courseClass.maxCapacity }}</ElDescriptionsItem>
      </ElDescriptions>
    </ElCard>

    <ElCard shadow="never" :header="t('classes.studentList')">
      <div class="toolbar" style="margin-bottom: 12px">
        <NuxtLink :to="`/attendance?classId=${id}`"><ElButton>{{ t('nav.attendance') }}</ElButton></NuxtLink>
        <NuxtLink :to="`/grades?classId=${id}`"><ElButton>{{ t('nav.grades') }}</ElButton></NuxtLink>
      </div>
      <ElTable :data="students" :empty-text="t('common.noData')">
        <ElTableColumn type="index" label="#" width="60" />
        <ElTableColumn :label="t('fields.code')" width="130">
          <template #default="{ row }">
            <NuxtLink :to="`/students/${row.studentId}`">{{ row.studentCode }}</NuxtLink>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="studentName" :label="t('fields.fullName')" />
        <ElTableColumn :label="t('fields.learningStatus')" width="160">
          <template #default="{ row }"><StatusTag group="learningStatus" :value="row.learningStatus" /></template>
        </ElTableColumn>
        <ElTableColumn :label="t('fields.paymentStatus')" width="170">
          <template #default="{ row }"><StatusTag group="paymentStatus" :value="row.paymentStatus" /></template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <ClassFormDialog v-model="dialogVisible" :course-class="courseClass" @saved="load" />
  </div>
</template>
