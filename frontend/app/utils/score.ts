import type { GradingScheme, Skill } from '~/types/enums'

export interface ScoreRange {
  min: number
  max: number
  step: number
}

/** Giống ScoreCalculator.GetRange ở backend. */
export function scoreRange(scheme: GradingScheme, skill: Skill): ScoreRange {
  if (scheme === 'Ielts') return { min: 0, max: 9, step: 0.5 }
  if (scheme === 'Toeic') {
    return skill === 'listening' || skill === 'reading' ? { min: 5, max: 495, step: 5 } : { min: 0, max: 200, step: 10 }
  }
  return { min: 0, max: 10, step: 0.1 }
}

export function roundIeltsBand(average: number): number {
  const whole = Math.floor(average)
  const fraction = average - whole
  if (fraction < 0.25) return whole
  if (fraction < 0.75) return whole + 0.5
  return whole + 1
}

/** Xem trước điểm tổng trên giao diện. Giá trị chính thức do backend tính khi lưu. */
export function previewOverall(
  scheme: GradingScheme,
  s: { listening: number | null; reading: number | null; writing: number | null; speaking: number | null },
): number | null {
  if (scheme === 'Toeic') {
    return s.listening != null && s.reading != null ? s.listening + s.reading : null
  }
  const values = [s.listening, s.reading, s.writing, s.speaking]
  if (scheme === 'Ielts') {
    if (values.some((v) => v == null)) return null
    return roundIeltsBand((values as number[]).reduce((a, b) => a + b, 0) / 4)
  }
  const entered = values.filter((v): v is number => v != null)
  if (entered.length === 0) return null
  return Math.round((entered.reduce((a, b) => a + b, 0) / entered.length) * 10) / 10
}
