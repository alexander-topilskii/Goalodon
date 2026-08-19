import { describe, expect, it } from 'vitest'
import type { DayIndexEntry } from './day-file/types.ts'
import { projectDayRows, spotItems, summarizeProjects } from './projects.ts'

const days: Record<string, DayIndexEntry> = {
  '2026-08-10': {
    goal: 'GTG',
    total: 5,
    done: 5,
    hasContent: true,
    goals: [{ title: 'GTG', project: 'Подтягивания', total: 5, done: 5 }],
  },
  '2026-08-19': {
    goal: 'Объем',
    total: 7,
    done: 1,
    hasContent: true,
    goals: [
      { title: 'Объем', project: 'Подтягивания', total: 6, done: 0 },
      { title: 'Греческий', project: '', total: 1, done: 1 },
    ],
  },
}

describe('project view', () => {
  it('groups training days into a project and leaves spot goals aside', () => {
    const projects = summarizeProjects(days)
    expect(projects).toEqual([
      {
        name: 'Подтягивания',
        days: 2,
        total: 11,
        done: 5,
        start: '2026-08-10',
        end: '2026-08-19',
      },
    ])
    expect(spotItems(days)).toEqual([
      { date: '2026-08-19', title: 'Греческий', total: 1, done: 1 },
    ])
    expect(projectDayRows(days, 'Подтягивания').map((row) => row.date)).toEqual([
      '2026-08-10',
      '2026-08-19',
    ])
  })
})
