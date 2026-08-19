import { describe, expect, it } from 'vitest'
import type { DayIndexEntry, GraphIndex } from './day-file/types.ts'
import {
  GITHUB_READ_LAG_MS,
  applyOverlay,
  mergeOverlay,
  pickDayRead,
  type DaySnapshot,
  type OverlayMap,
} from './restore.ts'

const pullups: DayIndexEntry = {
  goal: 'Объем',
  total: 6,
  done: 2,
  hasContent: true,
  goals: [{ title: 'Объем', project: 'Подтягивания', total: 6, done: 2 }],
}

const checked: DayIndexEntry = {
  ...pullups,
  done: 6,
  goals: [{ title: 'Объем', project: 'Подтягивания', total: 6, done: 6 }],
}

function index(days: GraphIndex['days'], generatedAt: string | null): GraphIndex {
  return { generatedAt, days }
}

describe('mergeOverlay', () => {
  it('keeps a local save until the baked index catches up', () => {
    const overlay: OverlayMap = {
      '2026-08-19': { ...checked, updatedAt: Date.parse('2026-08-19T18:00:00.000Z') },
    }
    const baked = index(
      { '2026-08-19': pullups },
      '2026-08-19T17:00:00.000Z',
    )
    expect(applyOverlay(baked, overlay).days['2026-08-19']?.done).toBe(6)
    expect(mergeOverlay(baked, overlay).overlay['2026-08-19']).toBeDefined()
  })

  it('drops overlay once the index matches the save', () => {
    const overlay: OverlayMap = {
      '2026-08-19': { ...checked, updatedAt: Date.parse('2026-08-19T18:00:00.000Z') },
    }
    const baked = index({ '2026-08-19': checked }, '2026-08-19T18:01:00.000Z')
    expect(mergeOverlay(baked, overlay).overlay).toEqual({})
    expect(applyOverlay(baked, overlay).days['2026-08-19']?.done).toBe(6)
  })

  it('lets a newer baked index win over an older overlay', () => {
    const overlay: OverlayMap = {
      '2026-08-19': { ...checked, updatedAt: Date.parse('2026-08-19T17:00:00.000Z') },
    }
    const baked = index({ '2026-08-19': pullups }, '2026-08-19T18:00:00.000Z')
    expect(mergeOverlay(baked, overlay).overlay).toEqual({})
    expect(applyOverlay(baked, overlay).days['2026-08-19']?.done).toBe(2)
  })
})

describe('pickDayRead', () => {
  const remote = { sha: 'old', text: 'remote old' }
  const cache = (over: Partial<DaySnapshot>): DaySnapshot => ({
    sha: 'new',
    text: 'local new',
    updatedAt: 1_000,
    confirmed: true,
    ...over,
  })

  it('keeps an unconfirmed local edit even if GitHub still has the old blob', () => {
    const picked = pickDayRead(cache({ sha: 'old', confirmed: false, updatedAt: 50 }), remote, 100)
    expect(picked).toEqual({ text: 'local new', writeSha: 'old', fromCache: true })
  })

  it('keeps a confirmed write while Contents GET is still stale', () => {
    const picked = pickDayRead(cache({ updatedAt: 50 }), remote, 100)
    expect(picked).toEqual({ text: 'local new', writeSha: 'new', fromCache: true })
  })

  it('switches to GitHub once the blob sha matches', () => {
    const picked = pickDayRead(
      cache({ sha: 'old', text: 'local new', updatedAt: 50 }),
      remote,
      100,
    )
    expect(picked).toEqual({ text: 'remote old', writeSha: 'old', fromCache: false })
  })

  it('falls back to GitHub after the lag window if shas still differ', () => {
    const picked = pickDayRead(
      cache({ updatedAt: 50 }),
      remote,
      50 + GITHUB_READ_LAG_MS + 1,
    )
    expect(picked).toEqual({ text: 'remote old', writeSha: 'old', fromCache: false })
  })

  it('keeps a just-created file when GET still 404s', () => {
    const picked = pickDayRead(cache({ sha: 'abc', updatedAt: 50 }), null, 100)
    expect(picked.fromCache).toBe(true)
    expect(picked.text).toBe('local new')
  })
})
