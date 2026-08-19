import { describe, expect, it } from 'vitest'
import { isValidISODate, monthCells, shiftMonth } from './dates.ts'

describe('dates', () => {
  it('rejects impossible calendar dates', () => {
    expect(isValidISODate('2026-13-40')).toBe(false)
    expect(isValidISODate('2026-02-29')).toBe(false)
    expect(isValidISODate('2024-02-29')).toBe(true)
    expect(isValidISODate('2026-08-19')).toBe(true)
  })

  it('builds a Monday-first August 2026 grid', () => {
    const cells = monthCells(2026, 8)
    expect(cells).toHaveLength(42)
    expect(cells[0]?.date).toBe('2026-07-27')
    expect(cells[5]?.date).toBe('2026-08-01')
    expect(cells[5]?.inMonth).toBe(true)
  })

  it('shifts months across a year boundary', () => {
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 })
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 })
  })
})
