import { FetchError } from 'ofetch'
import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h } from 'vue'

function fetchError(status: number, data: unknown) {
  const error = new FetchError('Request failed')
  Object.assign(error, { statusCode: status, data })
  return error
}

async function translateWith(locale: 'vi' | 'en', error: unknown) {
  // setLocale nạp file ngôn ngữ (lazy) giống khi người dùng đổi ngôn ngữ trong app
  await useNuxtApp().$i18n.setLocale(locale)

  let message = ''
  await mountSuspended(
    defineComponent({
      setup() {
        message = useApiErrors().translate(toApiError(error))
        return () => h('div')
      },
    }),
  )
  return message
}

describe('useApiErrors', () => {
  it('translates business error codes', async () => {
    const error = fetchError(422, { code: 'class.full', title: 'Class IELTS-01 is full (15 students).' })

    expect(await translateWith('vi', error)).toBe('Lớp đã đủ sĩ số')
    expect(await translateWith('en', error)).toBe('The class is full')
  })

  it('translates validation errors with field names and parameters', async () => {
    const error = fetchError(400, {
      code: 'validation',
      errors: { totalSessions: [{ code: 'InclusiveBetweenValidator', message: '...', params: { from: 1, to: 200 } }] },
    })

    expect(await translateWith('vi', error)).toBe('Tổng số buổi phải từ 1 đến 200')
  })

  it('falls back to the server message for unknown codes', async () => {
    const error = fetchError(422, { code: 'something.new', title: 'Server explanation' })

    expect(await translateWith('en', error)).toBe('Server explanation')
  })
})
