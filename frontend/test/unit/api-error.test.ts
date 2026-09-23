import { FetchError } from 'ofetch'
import { describe, expect, it } from 'vitest'
import { toApiError } from '~/utils/api-error'
import { cleanQuery } from '~/utils/query'

function fetchError(status: number, data: unknown) {
  const error = new FetchError('Request failed')
  Object.assign(error, { statusCode: status, data })
  return error
}

describe('toApiError', () => {
  it('reads code, title and field errors from ProblemDetails', () => {
    const error = toApiError(
      fetchError(400, {
        code: 'validation',
        title: 'One or more validation errors occurred.',
        errors: { name: [{ code: 'NotEmptyValidator', message: "'Name' must not be empty.", params: {} }] },
      }),
    )

    expect(error.status).toBe(400)
    expect(error.code).toBe('validation')
    expect(error.errors.name?.[0]?.code).toBe('NotEmptyValidator')
  })

  it('falls back to http.<status> when the body has no code', () => {
    expect(toApiError(fetchError(502, undefined)).code).toBe('http.502')
  })

  it('wraps non-HTTP errors', () => {
    expect(toApiError(new Error('boom'))).toMatchObject({ status: 0, code: 'unknown', title: 'boom' })
  })
})

describe('cleanQuery', () => {
  it('drops empty values but keeps false and 0', () => {
    expect(cleanQuery({ search: '', classId: undefined, isActive: false, page: 0, role: null })).toEqual({
      isActive: false,
      page: 0,
    })
  })
})
