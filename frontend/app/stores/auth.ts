import type { AuthResponse, CurrentUser } from '~/types/api'
import type { UserRole } from '~/types/enums'

interface Session {
  token: string
  expiresAt: string
  user: CurrentUser
}

export const useAuthStore = defineStore('auth', () => {
  // Lưu phiên trong cookie (SameSite=Strict) để giữ đăng nhập khi tải lại trang
  const session = useCookie<Session | null>('ec_session', { sameSite: 'strict', secure: !import.meta.dev, default: () => null })

  const token = computed(() => session.value?.token ?? null)
  const user = computed(() => session.value?.user ?? null)
  const isAuthenticated = computed(
    () => !!session.value && new Date(session.value.expiresAt).getTime() > Date.now(),
  )
  const homePath = computed(() => (user.value?.role === 'Student' ? '/portal' : '/dashboard'))

  function setSession(auth: AuthResponse) {
    session.value = { token: auth.accessToken, expiresAt: auth.expiresAt, user: auth.user }
  }

  function hasRole(...roles: UserRole[]) {
    return !!user.value && roles.includes(user.value.role)
  }

  function clear() {
    session.value = null
  }

  return { token, user, isAuthenticated, homePath, setSession, hasRole, clear }
})
