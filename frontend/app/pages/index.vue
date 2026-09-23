<script setup lang="ts">
// Trang gốc chỉ điều hướng: giáo vụ / quản trị vào Tổng quan, học viên vào cổng học viên
const auth = useAuthStore()
await navigateTo(auth.homePath, { replace: true })
</script>

<template>
  <div />
</template>
