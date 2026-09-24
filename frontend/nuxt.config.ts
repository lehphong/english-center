// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },

  // Trang quản trị sau đăng nhập, không cần SEO: chạy SPA, build ra file tĩnh (nuxt generate) phục vụ bằng nginx.
  ssr: false,

  modules: ['@element-plus/nuxt', '@pinia/nuxt', '@nuxtjs/i18n', '@nuxt/eslint'],

  // Thứ tự: token của design system → ánh xạ Element Plus → style chung
  css: ['~/assets/css/tokens.css', '~/assets/css/element-plus.css', '~/assets/css/main.css'],

  components: [{ path: '~/components', pathPrefix: false }],

  runtimeConfig: {
    public: {
      // Đường dẫn gọi API. Mặc định cùng domain (dev: proxy bên dưới, production: nginx)
      apiBase: '/api',
    },
  },

  nitro: {
    devProxy: {
      '/api': { target: 'http://localhost:5080/api', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5080/uploads', changeOrigin: true },
    },
  },

  elementPlus: {
    importStyle: 'css',
  },

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'vi',
    locales: [
      { code: 'vi', language: 'vi-VN', name: 'Tiếng Việt', file: 'vi.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'ec_locale',
      fallbackLocale: 'vi',
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap',
        },
      ],
    },
  },
})
