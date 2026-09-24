<script setup lang="ts">
import {
  Calendar,
  Collection,
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
        <BrandMark />
        <span>{{ t('app.name') }}</span>
      </NuxtLink>
      <!-- Điều hướng là các liên kết thật (mở tab mới được), không dùng role="menu" của ElMenu -->
      <nav class="nav" :aria-label="t('nav.main')">
        <template v-for="(group, index) in groups" :key="index">
          <div v-if="group.items.length" class="nav-group">
            <p v-if="group.title" class="nav-title">{{ group.title }}</p>
            <ul>
              <li v-for="item in group.items" :key="item.to">
                <NuxtLink
                  :to="item.to"
                  class="nav-item"
                  :class="{ 'is-active': item.to === activeMenu }"
                  :aria-current="item.to === activeMenu ? 'page' : undefined"
                >
                  <ElIcon><component :is="item.icon" /></ElIcon>
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </template>
      </nav>
    </ElAside>
    <ElContainer>
      <ElHeader class="header">
        <span class="muted">{{ t('app.tagline') }}</span>
        <div class="header-actions">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <UserMenu />
        </div>
      </ElHeader>
      <ElMain class="main">
        <slot />
      </ElMain>
    </ElContainer>
  </ElContainer>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}

/* 30% cấu trúc: khung điều hướng nền Nâu Đất */
.aside {
  width: var(--app-sidebar-width);
  padding: 0 var(--space-2) var(--space-4);
  background: var(--umber);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 64px;
  padding: 0 var(--space-3);
  font-size: 16px;
  font-weight: 700;
  color: var(--on-umber);
  text-decoration: none;
}

.brand:hover {
  text-decoration: none;
}

.nav ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-title {
  margin: 0;
  padding: var(--space-4) var(--space-3) var(--space-1);
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--on-umber-muted);
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  margin-bottom: 2px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--on-umber-muted);
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
}

.nav-item:hover {
  color: var(--on-umber);
  background: var(--umber-soft);
  text-decoration: none;
}

.nav-item:focus-visible {
  outline: 2px solid var(--ochre);
  outline-offset: -2px;
}

.nav-item .el-icon {
  font-size: 18px;
}

/* Mục đang chọn: nền umber-soft + vạch Hoàng Thổ — dấu ochre duy nhất trong sidebar */
.nav-item.is-active {
  color: var(--on-umber);
  background: var(--umber-soft);
}

.nav-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 2px;
  background: var(--ochre);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.main {
  padding: var(--space-5);
}
</style>
