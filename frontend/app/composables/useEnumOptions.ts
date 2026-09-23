import { ENUM_GROUPS, type EnumGroup } from '~/types/enums'

/** Danh sách lựa chọn đã dịch cho một nhóm enum, dùng trong el-select. */
export function useEnumOptions() {
  const { t } = useI18n()

  const label = (group: EnumGroup, value: string | null | undefined) =>
    value ? t(`enums.${group}.${value}`) : ''

  const options = (group: EnumGroup) =>
    ENUM_GROUPS[group].map((value) => ({ value, label: t(`enums.${group}.${value}`) }))

  return { label, options }
}
