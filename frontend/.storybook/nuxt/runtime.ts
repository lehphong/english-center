// Stand-ins for the Nuxt runtime APIs used by app/ code, so components, layouts and pages render in Storybook.
// They are auto-imported in place of Nuxt's own (see .storybook/main.ts).
import { action } from 'storybook/actions'
import { computed, reactive, ref, type Ref } from 'vue'
import { useI18n as useVueI18n } from 'vue-i18n'
import { createApi } from '../../app/api'
import { mockHttp } from '../mocks/http'

// --- cookies: one shared ref per name, like useCookie within a single app
const cookies = new Map<string, Ref<unknown>>()

export function useCookie<T>(name: string, options: { default?: () => T } = {}): Ref<T> {
  if (!cookies.has(name)) cookies.set(name, ref(options.default ? options.default() : null))
  return cookies.get(name) as Ref<T>
}

// --- routing
export const route = reactive({
  path: '/',
  fullPath: '/',
  query: {} as Record<string, string>,
  params: {} as Record<string, string>,
})

export const useRoute = () => route

const logNavigation = action('navigateTo')
export function navigateTo(to: unknown) {
  logNavigation(to)
  return Promise.resolve()
}

// --- app context
const api = createApi(mockHttp as never)
export const useNuxtApp = () => ({ $api: api, runWithContext: <T>(fn: () => T) => fn() })
export const useRuntimeConfig = () => ({ public: { apiBase: '/api' } })

// Page macros and head management have no effect outside Nuxt
export const definePageMeta = (_meta: unknown) => {}
export const useHead = (_head: unknown) => {}
export const clearError = (options?: unknown) => action('clearError')(options)

// --- i18n: vue-i18n plus the `locales` / `setLocale` that @nuxtjs/i18n adds
const LOCALES = [
  { code: 'vi' as const, name: 'Tiếng Việt' },
  { code: 'en' as const, name: 'English' },
]

export function useI18n() {
  const composer = useVueI18n()
  return Object.assign(composer, {
    locales: computed(() => LOCALES),
    setLocale: async (code: 'vi' | 'en') => {
      composer.locale.value = code
    },
  })
}
