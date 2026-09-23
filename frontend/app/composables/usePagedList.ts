import type { PagedResult } from '~/types/api'

/** Trạng thái danh sách có phân trang + bộ lọc, dùng chung cho các trang quản lý. */
export function usePagedList<T, Q extends object>(
  fetcher: (query: Q & { page: number; pageSize: number }) => Promise<PagedResult<T>>,
  filters: Q,
  options: { pageSize?: number } = {},
) {
  const { notifyError } = useApiErrors()
  const query = reactive({ page: 1, pageSize: options.pageSize ?? 10, ...filters }) as Q & {
    page: number
    pageSize: number
  }
  const items = ref<T[]>([]) as Ref<T[]>
  const total = ref(0)
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      const result = await fetcher({ ...query })
      items.value = result.items
      total.value = result.totalCount
    } catch (error) {
      notifyError(error)
    } finally {
      loading.value = false
    }
  }

  function search() {
    query.page = 1
    return load()
  }

  function reset() {
    Object.assign(query, filters, { page: 1 })
    return load()
  }

  onMounted(load)

  return { query, items, total, loading, load, search, reset }
}
