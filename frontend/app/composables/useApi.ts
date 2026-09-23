import type { Api } from '~/api'

export function useApi(): Api {
  return useNuxtApp().$api as Api
}
