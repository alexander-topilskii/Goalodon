import { allTasks, isGoalEmpty, primaryGoalTitle } from './goals.ts'
import type { DayFile, DayIndexEntry } from './types.ts'

export function statsFromDay(day: DayFile): DayIndexEntry {
  const tasks = allTasks(day.goals)
  const total = tasks.length
  const done = tasks.filter((task) => task.done).length
  const hasContent = day.goals.some((goal) => !isGoalEmpty(goal))
  return {
    goal: primaryGoalTitle(day.goals),
    total,
    done,
    hasContent,
    goals: day.goals
      .filter((goal) => !isGoalEmpty(goal))
      .map((goal) => ({
        title: goal.title,
        project: goal.project.trim(),
        total: goal.tasks.length,
        done: goal.tasks.filter((task) => task.done).length,
      })),
  }
}

export function isDayEmpty(day: DayFile): boolean {
  return !statsFromDay(day).hasContent
}
