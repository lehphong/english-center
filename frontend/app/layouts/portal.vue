<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const items = computed(() => [
  { to: '/portal', label: t('nav.myClasses') },
  { to: '/portal/attendance', label: t('nav.myAttendance') },
  { to: '/portal/grades', label: t('nav.myGrades') },
  { to: '/portal/profile', label: t('nav.myProfile') },
])
</script>

<template>
  <div class="portal">
    <header class="header">
      <NuxtLink to="/portal" class="brand">{{ t('app.name') }}</NuxtLink>
      <ElMenu
        mode="horizontal"
        :default-active="route.path"
        :ellipsis="false"
        class="menu"
        @select="(index: string) => navigateTo(index)"
      >
        <ElMenuItem v-for="item in items" :key="item.to" :index="item.to">{{ item.label }}</ElMenuItem>
      </ElMenu>
      <div class="header-actions">
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </header>
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.brand {
  font-weight: 600;
  color: var(--el-color-primary);
  text-decoration: none;
  white-space: nowrap;
}

.menu {
  flex: 1;
  border-bottom: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}
</style>
