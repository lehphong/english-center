export type ThemeMode = 'light' | 'dark'

/** Theme sáng / tối của design system Hoàng Thổ; lần đầu theo cài đặt hệ điều hành, sau đó nhớ trong cookie. */
export function useTheme() {
  const cookie = useCookie<ThemeMode | null>('ec_theme', { sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, default: () => null })
  const systemDark = import.meta.client && window.matchMedia('(prefers-color-scheme: dark)').matches

  const theme = computed<ThemeMode>({
    get: () => cookie.value ?? (systemDark ? 'dark' : 'light'),
    set: (value) => (cookie.value = value),
  })

  const toggle = () => (theme.value = theme.value === 'dark' ? 'light' : 'dark')

  return { theme, toggle }
}
