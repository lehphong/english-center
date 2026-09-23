export function useFormat() {
  const { locale } = useI18n()
  const tag = computed(() => (locale.value === 'en' ? 'en-US' : 'vi-VN'))

  const money = (value: number | null | undefined) =>
    value == null
      ? '—'
      : new Intl.NumberFormat(tag.value, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)

  /** Ngày dạng 'YYYY-MM-DD' (DateOnly của API) */
  const date = (value: string | null | undefined) =>
    value ? new Intl.DateTimeFormat(tag.value).format(new Date(`${value}T00:00:00`)) : '—'

  const dateTime = (value: string | null | undefined) =>
    value ? new Intl.DateTimeFormat(tag.value, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—'

  const score = (value: number | null | undefined) => (value == null ? '—' : String(value))

  return { money, date, dateTime, score }
}
