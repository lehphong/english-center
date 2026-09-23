<script setup lang="ts">
import {
  Calendar,
  Collection,
  DataAnalysis,
  Document,
  EditPen,
  Notebook,
  Odometer,
  School,
  Tickets,
  User,
  UserFilled,
} from '@element-plus/icons-vue'
import type { Component } from 'vue'

interface MenuItem {
  to: string
  label: string
  icon: Component
  adminOnly?: boolean
}

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()

const groups = computed<{ title?: string; items: MenuItem[] }[]>(() => [
  { items: [{ to: '/dashboard', label: t('nav.dashboard'), icon: Odometer }] },
  {
    title: t('nav.training'),
    items: [
      { to: '/courses', label: t('nav.courses'), icon: Collection },
      { to: '/classes', label: t('nav.classes'), icon: School },
      { to: '/students', label: t('nav.students'), icon: UserFilled },
      { to: '/enrollments', label: t('nav.enrollments'), icon: Tickets },
      { to: '/attendance', label: t('nav.attendance'), icon: Calendar },
      { to: '/attendance/history', label: t('nav.attendanceHistory'), icon: Document },
      { to: '/grades', label: t('nav.grades'), icon: EditPen },
      { to: '/grades/history', label: t('nav.gradeHistory'), icon: Notebook },
    ],
  },
  {
    title: t('nav.system'),
    items: [{ to: '/users', label: t('nav.users'), icon: User, adminOnly: true }].filter(
      (item) => !item.adminOnly || auth.hasRole('Admin'),
    ),
  },
])

// Giữ mục menu được chọn cả khi đang ở trang chi tiết (vd /classes/3 → /classes)
const activeMenu = computed(() => {
  const all = groups.value.flatMap((g) => g.items.map((i) => i.to))
  return all.filter((to) => route.path === to || route.path.startsWith(`${to}/`)).sort((a, b) => b.length - a.length)[0]
})
</script>

<template>
  <ElContainer class="layout">
    <ElAside class="aside">
      <NuxtLink to="/dashboard" class="brand">
        <ElIcon :size="22"><DataAnalysis /></ElIcon>
        <span>{{ t('app.name') }}</span>
      </NuxtLink>
      <ElMenu :default-active="activeMenu" class="menu" @select="(index: string) => navigateTo(index)">
        <template v-for="(group, index) in groups" :key="index">
          <ElMenuItemGroup v-if="group.items.length" :title="group.title">
            <ElMenuItem v-for="item in group.items" :key="item.to" :index="item.to">
              <ElIcon><component :is="item.icon" /></ElIcon>
              <span>{{ item.label }}</span>
            </ElMenuItem>
          </ElMenuItemGroup>
        </template>
      </ElMenu>
    </ElAside>
    <ElContainer>
      <ElHeader class="header">
        <span class="muted">{{ t('app.tagline') }}</span>
        <div class="header-actions">
          <LanguageSwitcher />
          <UserMenu />
        </div>
      </ElHeader>
      <ElMain>
        <slot />
      </ElMain>
    </ElContainer>
  </ElContainer>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}

.aside {
  width: var(--app-sidebar-width);
  background: #fff;
  border-right: 1px solid var(--el-border-color-lighter);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 60px;
  padding: 0 20px;
  font-weight: 600;
  color: var(--el-color-primary);
  text-decoration: none;
}

.menu {
  border-right: none;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
