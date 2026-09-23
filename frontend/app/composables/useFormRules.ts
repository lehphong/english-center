import type { FormItemRule } from 'element-plus'

/** Rule cho el-form với thông báo đã dịch; khớp với validator ở backend. */
export function useFormRules() {
  const { t } = useI18n()

  return {
    required: (): FormItemRule => ({ required: true, message: t('validation.required'), trigger: ['blur', 'change'] }),
    max: (max: number): FormItemRule => ({ max, message: t('validation.maxLength', { max }), trigger: 'blur' }),
    between: (min: number, max: number): FormItemRule => ({
      type: 'number',
      min,
      max,
      message: t('validation.between', { min, max }),
      trigger: 'change',
    }),
    email: (): FormItemRule => ({ type: 'email', message: t('validation.email'), trigger: 'blur' }),
    phone: (): FormItemRule => ({ pattern: /^0\d{9}$/, message: t('validation.phone'), trigger: 'blur' }),
    code: (): FormItemRule => ({ pattern: /^[A-Za-z0-9._-]+$/, message: t('validation.code'), trigger: 'blur' }),
    password: (): FormItemRule => ({ min: 8, max: 100, message: t('validation.password'), trigger: 'blur' }),
  }
}
