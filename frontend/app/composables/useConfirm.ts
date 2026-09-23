export function useConfirm() {
  const { t } = useI18n()

  /** Hỏi xác nhận; trả về false khi người dùng bấm Hủy. */
  async function confirmDelete(name: string) {
    try {
      await ElMessageBox.confirm(t('common.confirmDelete', { name }), t('common.delete'), {
        type: 'warning',
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel'),
        confirmButtonClass: 'el-button--danger',
      })
      return true
    } catch {
      return false
    }
  }

  return { confirmDelete }
}
