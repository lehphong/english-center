import type { ApiError, FieldError } from '~/utils/api-error'

/**
 * Dịch lỗi từ API theo mã lỗi: errors.<code> cho lỗi nghiệp vụ, validation.<code> cho lỗi từng field.
 * Không có bản dịch thì dùng thông báo tiếng Anh do backend trả về.
 */
export function useApiErrors() {
  const { t, te } = useI18n()

  function fieldLabel(path: string) {
    const name = path.replace(/\[\d+\]/g, '').split('.').pop() ?? path
    return te(`fields.${name}`) ? t(`fields.${name}`) : name
  }

  function translateFieldError(path: string, error: FieldError) {
    const key = `validation.${error.code}`
    return te(key) ? t(key, { field: fieldLabel(path), ...(error.params ?? {}) }) : error.message
  }

  function translate(error: ApiError): string {
    if (error.code === 'validation') {
      const messages = Object.entries(error.errors).flatMap(([path, list]) =>
        list.map((e) => translateFieldError(path, e)),
      )
      return messages.length ? messages.join('\n') : t('errors.validation')
    }
    const key = `errors.${error.code}`
    return te(key) ? t(key) : error.title || t('errors.unknown')
  }

  function notifyError(error: unknown) {
    const apiError = toApiError(error)
    // 401 đã được plugin api xử lý (chuyển về trang đăng nhập)
    if (apiError.status === 401 && apiError.code !== 'auth.invalidCredentials' && apiError.code !== 'auth.accountLocked') {
      return
    }
    ElMessage({ type: 'error', message: translate(apiError), showClose: true, duration: 5000 })
  }

  return { translate, notifyError }
}
