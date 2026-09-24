import { withThemeByClassName } from '@storybook/addon-themes'
import type { Decorator, Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import ElementPlus, { ElConfigProvider } from 'element-plus'
import elementEn from 'element-plus/es/locale/lang/en'
import elementVi from 'element-plus/es/locale/lang/vi'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import { defineComponent, h, type Component } from 'vue'
import { createI18n } from 'vue-i18n'
import en from '../i18n/locales/en.json'
import vi from '../i18n/locales/vi.json'
import AuthLayout from '../app/layouts/auth.vue'
import DefaultLayout from '../app/layouts/default.vue'
import PortalLayout from '../app/layouts/portal.vue'
import '../app/assets/css/tokens.css'
import '../app/assets/css/element-plus.css'
import '../app/assets/css/main.css'
import '../stories/showcase.css'
import { sessionUsers } from './mocks/data'
import { navigateTo, route, useCookie } from './nuxt/runtime'

const i18n = createI18n({ legacy: false, locale: 'vi', fallbackLocale: 'vi', messages: { vi, en } })

// <NuxtLink> as a plain link that reports navigation to the Actions panel
const NuxtLink = defineComponent({
  props: { to: { type: [String, Object], required: true } },
  setup: (props, { slots }) => () =>
    h('a', {
      href: typeof props.to === 'string' ? props.to : '#',
      onClick: (event: Event) => {
        event.preventDefault()
        navigateTo(props.to)
      },
    }, slots.default?.()),
})

setup((app) => {
  app.use(ElementPlus)
  app.use(i18n)
  app.use(createPinia())
  app.component('NuxtLink', NuxtLink)
})

export interface NuxtStoryParameters {
  /** Signed-in role for the story; omit for a signed-out visitor */
  session?: keyof typeof sessionUsers
  /** Current route seen by useRoute() */
  route?: { path: string; query?: Record<string, string>; params?: Record<string, string> }
  /** Wrap the story in one of the app layouts */
  layout?: 'default' | 'portal' | 'auth'
}

const LAYOUTS: Record<NonNullable<NuxtStoryParameters['layout']>, Component> = {
  default: DefaultLayout,
  portal: PortalLayout,
  auth: AuthLayout,
}

const withNuxtContext: Decorator = (story, context) => {
  const nuxt = (context.parameters.nuxt ?? {}) as NuxtStoryParameters
  const session = useCookie<unknown>('ec_session', { default: () => null })
  session.value = nuxt.session
    ? { token: 'storybook-token', expiresAt: '2099-01-01T00:00:00Z', user: sessionUsers[nuxt.session] }
    : null

  const path = nuxt.route?.path ?? '/'
  const query = nuxt.route?.query ?? {}
  Object.assign(route, {
    path,
    fullPath: path + (Object.keys(query).length ? `?${new URLSearchParams(query)}` : ''),
    query,
    params: nuxt.route?.params ?? {},
  })

  const layout = nuxt.layout ? LAYOUTS[nuxt.layout] : null
  return layout
    ? { components: { story, AppLayout: layout }, template: '<AppLayout><story /></AppLayout>' }
    : { components: { story }, template: '<story />' }
}

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    locale: {
      description: 'Language',
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
    withNuxtContext,
    // Light / dark theme exactly like the app: class `dark` on <html>
    withThemeByClassName({ themes: { Light: '', Dark: 'dark' }, defaultTheme: 'Light', parentSelector: 'html' }),
    // Language toolbar: app strings and Element Plus strings (pagination, date picker...), like app.vue
    (story, context) => {
      const locale = context.globals.locale === 'en' ? 'en' : 'vi'
      i18n.global.locale.value = locale
      return {
        components: { story, ElConfigProvider },
        setup: () => ({ elementLocale: locale === 'en' ? elementEn : elementVi }),
        template: '<ElConfigProvider :locale="elementLocale"><story /></ElConfigProvider>',
      }
    },
  ],
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Foundations',
          'Components',
          ['Actions', 'Form', 'Data display', 'Feedback', 'Navigation', 'Brand'],
          'Patterns',
          'Layouts',
          'Pages',
        ],
      },
    },
    controls: { expanded: true },
    // Principle 9: every story is checked for accessibility
    a11y: { test: 'error' },
  },
}

export default preview
