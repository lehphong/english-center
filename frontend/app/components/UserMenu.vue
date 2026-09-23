<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'

const { t } = useI18n()
const auth = useAuthStore()
const { label } = useEnumOptions()
const showChangePassword = ref(false)

async function onCommand(command: string) {
  if (command === 'password') {
    showChangePassword.value = true
  } else if (command === 'logout') {
    auth.clear()
    await navigateTo('/login')
  }
}
</script>

<template>
  <ElDropdown trigger="click" @command="onCommand">
    <span class="user">
      <ElAvatar :size="28">{{ (auth.user?.fullName ?? auth.user?.username ?? '?').charAt(0).toUpperCase() }}</ElAvatar>
      <span>
        <strong>{{ auth.user?.fullName ?? auth.user?.username }}</strong>
        <small class="muted"> · {{ label('role', auth.user?.role) }}</small>
      </span>
      <ElIcon><ArrowDown /></ElIcon>
    </span>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem command="password">{{ t('common.changePassword') }}</ElDropdownItem>
        <ElDropdownItem command="logout" divided>{{ t('common.logout') }}</ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
  <ChangePasswordDialog v-model="showChangePassword" />
</template>

<style scoped>
.user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
</style>
