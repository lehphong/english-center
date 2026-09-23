<script setup lang="ts">
import type { Student } from '~/types/api'

definePageMeta({ layout: 'portal', roles: ['Student'] })

const { t } = useI18n()
useHead({ title: () => t('nav.myProfile') })

const api = useApi()
const { date } = useFormat()
const { label } = useEnumOptions()
const { notifyError } = useApiErrors()
const profile = ref<Student>()

onMounted(async () => {
  try {
    profile.value = await api.portal.profile()
  } catch (error) {
    notifyError(error)
  }
})
</script>

<template>
  <div class="page">
    <PageHeader :title="t('nav.myProfile')" />
    <ElCard v-if="profile" shadow="never">
      <div class="profile">
        <ElAvatar :src="profile.avatarUrl ?? undefined" :size="96">{{ profile.fullName.charAt(0) }}</ElAvatar>
        <ElDescriptions :column="2" border class="info">
          <ElDescriptionsItem :label="t('fields.fullName')">{{ profile.fullName }}</ElDescriptionsItem>
          <ElDescriptionsItem :label="t('fields.code')">{{ profile.code }}</ElDescriptionsItem>
          <ElDescriptionsItem :label="t('fields.email')">{{ profile.email }}</ElDescriptionsItem>
          <ElDescriptionsItem :label="t('fields.phoneNumber')">{{ profile.phoneNumber }}</ElDescriptionsItem>
          <ElDescriptionsItem :label="t('fields.dateOfBirth')">{{ date(profile.dateOfBirth) }}</ElDescriptionsItem>
          <ElDescriptionsItem :label="t('fields.gender')">{{ label('gender', profile.gender) }}</ElDescriptionsItem>
          <ElDescriptionsItem :label="t('fields.entryLevel')">{{ label('englishLevel', profile.entryLevel) }}</ElDescriptionsItem>
          <ElDescriptionsItem :label="t('fields.address')">{{ profile.address ?? '—' }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.profile {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.info {
  flex: 1;
}
</style>
