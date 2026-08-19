import type { DayFile, DayIndexEntry } from './types.ts'

export function statsFromDay(day: DayFile): DayIndexEntry {
  const total = day.tasks.length
  const done = day.tasks.filter((task) => task.done).length
  const hasContent = Boolean(day.goal.trim() || day.plan.trim() || total > 0)
  return {
    goal: day.goal,
    total,
    done,
    hasContent,
  }
}

export function isDayEmpty(day: DayFile): boolean {
  return !statsFromDay(day).hasContent
}
