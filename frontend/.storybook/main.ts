import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/vue3-vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { mergeConfig } from 'vite'

const app = fileURLToPath(new URL('../app', import.meta.url))
const nuxtRuntime = fileURLToPath(new URL('./nuxt/runtime.ts', import.meta.url))

// Nuxt APIs that app/ code uses without importing; Storybook resolves them to .storybook/nuxt/runtime.ts
const NUXT_APIS = ['useCookie', 'useRoute', 'navigateTo', 'useNuxtApp', 'useRuntimeConfig', 'definePageMeta', 'useHead', 'clearError', 'useI18n']

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.ts'],
  staticDirs: ['../public'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: { name: '@storybook/vue3-vite', options: {} },
  core: { disableTelemetry: true },
  // Tái tạo phần auto-import của Nuxt để component trong app/ chạy nguyên bản trong Storybook
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      plugins: [
        vue(),
        AutoImport({
          imports: ['vue', 'pinia', { from: nuxtRuntime, imports: NUXT_APIS }],
          dirs: [`${app}/composables`, `${app}/utils`, `${app}/stores`],
          resolvers: [ElementPlusResolver({ importStyle: false })],
          dts: false,
          // Nuxt cũng tự import trong template (vd previewOverall trong trang nhập điểm)
          vueTemplate: true,
        }),
        Components({
          dirs: [`${app}/components`],
          resolvers: [ElementPlusResolver({ importStyle: false })],
          dts: false,
        }),
      ],
      resolve: { alias: { '~': app, '@': app } },
    }),
}

export default config
