import type { DayIndexEntry } from './day-file/types.ts'

export type ProjectSummary = {
  name: string
  days: number
  total: number
  done: number
  start: string
  end: string
}

export type ProjectDayRow = {
  date: string
  title: string
  total: number
  done: number
}

export type SpotItem = {
  date: string
  title: string
  total: number
  done: number
}

export function summarizeProjects(days: Record<string, DayIndexEntry>): ProjectSummary[] {
  const byName = new Map<string, { dates: Set<string>; total: number; done: number }>()
  for (const [date, entry] of Object.entries(days)) {
    for (const goal of entry.goals) {
      const name = goal.project.trim()
      if (!name) continue
      const current = byName.get(name) ?? { dates: new Set<string>(), total: 0, done: 0 }
      current.dates.add(date)
      current.total += goal.total
      current.done += goal.done
      byName.set(name, current)
    }
  }
  return [...byName.entries()]
    .map(([name, value]) => {
      const dates = [...value.dates].sort()
      return {
        name,
        days: dates.length,
        total: value.total,
        done: value.done,
        start: dates[0] ?? '',
        end: dates.at(-1) ?? '',
      }
    })
    .sort((a, b) => b.end.localeCompare(a.end) || a.name.localeCompare(b.name, 'ru'))
}

export function projectDayRows(days: Record<string, DayIndexEntry>, name: string): ProjectDayRow[] {
  const rows: ProjectDayRow[] = []
  for (const date of Object.keys(days).sort()) {
    const goals = days[date]?.goals.filter((goal) => goal.project.trim() === name) ?? []
    if (!goals.length) continue
    rows.push({
      date,
      title: goals.map((goal) => goal.title).filter(Boolean).join(' · ') || name,
      total: goals.reduce((sum, goal) => sum + goal.total, 0),
      done: goals.reduce((sum, goal) => sum + goal.done, 0),
    })
  }
  return rows
}

export function spotItems(days: Record<string, DayIndexEntry>): SpotItem[] {
  const items: SpotItem[] = []
  for (const date of Object.keys(days).sort().reverse()) {
    for (const goal of days[date]?.goals ?? []) {
      if (goal.project.trim()) continue
      items.push({
        date,
        title: goal.title || 'Без названия',
        total: goal.total,
        done: goal.done,
      })
    }
  }
  return items
}
