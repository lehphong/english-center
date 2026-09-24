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
      <NuxtLink to="/portal" class="brand">
        <BrandMark />
        <span>{{ t('app.name') }}</span>
      </NuxtLink>
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
        <ThemeSwitcher />
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
.portal {
  min-height: 100vh;
}

/* 30% cấu trúc: thanh trên nền Nâu Đất */
.header {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  height: 64px;
  padding: 0 var(--space-5);
  background: var(--umber);
  color: var(--on-umber);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 16px;
  font-weight: 700;
  color: var(--on-umber);
  text-decoration: none;
  white-space: nowrap;
}

.brand:hover {
  text-decoration: none;
}

.menu {
  --el-menu-bg-color: var(--umber);
  --el-menu-text-color: var(--on-umber-muted);
  --el-menu-hover-text-color: var(--on-umber);
  --el-menu-hover-bg-color: var(--umber-soft);
  --el-menu-active-color: var(--on-umber);
  --el-menu-horizontal-height: 64px;
  flex: 1;
  border-bottom: none;
}

.menu :deep(.el-menu-item) {
  font-weight: 500;
}

/* Mục đang chọn: gạch chân Hoàng Thổ */
.menu :deep(.el-menu-item.is-active) {
  border-bottom: 3px solid var(--ochre) !important;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.header-actions :deep(.muted) {
  color: var(--on-umber-muted);
}

.content {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-5);
}
</style>
