import { describe, expect, it } from 'vitest'
import { previewOverall, roundIeltsBand, scoreRange } from '~/utils/score'

const scores = (listening: number | null, reading: number | null, writing: number | null, speaking: number | null) => ({
  listening,
  reading,
  writing,
  speaking,
})

describe('roundIeltsBand', () => {
  it.each([
    [6.125, 6],
    [6.25, 6.5],
    [6.375, 6.5],
    [6.75, 7],
    [9, 9],
  ])('%d -> %d', (average, expected) => {
    expect(roundIeltsBand(average)).toBe(expected)
  })
})

describe('previewOverall', () => {
  it('IELTS needs all four skills', () => {
    expect(previewOverall('Ielts', scores(7, 7, 7, null))).toBeNull()
    expect(previewOverall('Ielts', scores(6, 6.5, 6.5, 6.5))).toBe(6.5)
  })

  it('TOEIC is listening + reading', () => {
    expect(previewOverall('Toeic', scores(400, 385, 150, null))).toBe(785)
    expect(previewOverall('Toeic', scores(400, null, null, null))).toBeNull()
  })

  it('10-point scale averages entered skills to one decimal', () => {
    expect(previewOverall('Standard', scores(7, 8, 8, null))).toBe(7.7)
    expect(previewOverall('Standard', scores(null, null, null, null))).toBeNull()
  })
})

describe('scoreRange', () => {
  it('matches backend ranges', () => {
    expect(scoreRange('Ielts', 'speaking')).toEqual({ min: 0, max: 9, step: 0.5 })
    expect(scoreRange('Toeic', 'reading')).toEqual({ min: 5, max: 495, step: 5 })
    expect(scoreRange('Toeic', 'writing')).toEqual({ min: 0, max: 200, step: 10 })
  })
})
