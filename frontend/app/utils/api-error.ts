import { FetchError } from 'ofetch'

export interface FieldError {
  code: string
  message: string
  params?: Record<string, unknown> | null
}

/** Lỗi đã chuẩn hóa từ ProblemDetails của API. */
export interface ApiError {
  status: number
  code: string
  title: string
  errors: Record<string, FieldError[]>
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof FetchError) {
    const data = error.data as Partial<{ code: string; title: string; errors: Record<string, FieldError[]> }> | undefined
    return {
      status: error.statusCode ?? 0,
      code: data?.code ?? (error.statusCode ? `http.${error.statusCode}` : 'network'),
      title: data?.title ?? error.message,
      errors: data?.errors ?? {},
    }
  }
  return { status: 0, code: 'unknown', title: error instanceof Error ? error.message : String(error), errors: {} }
}
