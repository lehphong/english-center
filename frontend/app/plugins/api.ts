import { createApi } from '~/api'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  const http = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (auth.token) {
        options.headers.set('Authorization', `Bearer ${auth.token}`)
      }
      options.headers.set('Accept-Language', nuxtApp.$i18n.locale.value)
    },
    async onResponseError({ response }) {
      // Token hết hạn hoặc bị thu hồi: đăng xuất và quay về trang đăng nhập
      if (response.status === 401 && auth.token) {
        auth.clear()
        await nuxtApp.runWithContext(() =>
          navigateTo({ path: '/login', query: { redirect: useRoute().fullPath } }),
        )
      }
    },
  })

  return { provide: { api: createApi(http) } }
})
