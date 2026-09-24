import { withThemeByClassName } from '@storybook/addon-themes'
import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createI18n } from 'vue-i18n'
import en from '../i18n/locales/en.json'
import vi from '../i18n/locales/vi.json'
import '../app/assets/css/tokens.css'
import '../app/assets/css/element-plus.css'
import '../app/assets/css/main.css'

const i18n = createI18n({ legacy: false, locale: 'vi', fallbackLocale: 'vi', messages: { vi, en } })

setup((app) => {
  app.use(ElementPlus)
  app.use(i18n)
})

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    locale: {
      description: 'Ngôn ngữ',
      toolbar: {
        icon: 'globe',
        dynamicTitle: true,
        items: [
          { value: 'vi', title: 'Tiếng Việt' },
          { value: 'en', title: 'English' },
        ],
      },
    },
  },
  initialGlobals: { locale: 'vi' },
  decorators: [
    // Theme sáng / tối giống app: class `dark` trên <html>
    withThemeByClassName({ themes: { 'Sáng': '', 'Tối': 'dark' }, defaultTheme: 'Sáng', parentSelector: 'html' }),
    (story, context) => {
      i18n.global.locale.value = context.globals.locale ?? 'vi'
      return { components: { story }, template: '<div style="padding: 4px"><story /></div>' }
    },
  ],
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    controls: { expanded: true },
    // Nguyên tắc 9: kiểm tra khả năng tiếp cận ở mọi story
    a11y: { test: 'error' },
  },
}

export default preview
