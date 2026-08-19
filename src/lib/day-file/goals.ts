import { parseTaskList } from './tasks.ts'
import type { DayGoal, DayTask } from './types.ts'

const GOAL_HEADING = /^Цель:\s*(.*)$/
const TASKS_SUBHEADING = /^###[ \t]+Задачи[ \t]*$/m
const CHECKBOX_LINE = /^[-*]\s+\[[ xX]\]/
const PROJECT_LINE = /^Проект:\s*(.*)$/

export function emptyGoal(): DayGoal {
  return { title: '', project: '', plan: '', tasks: [] }
}

export function isGoalEmpty(goal: DayGoal): boolean {
  return !goal.title.trim() && !goal.project.trim() && !goal.plan.trim() && goal.tasks.length === 0
}

export function parseGoalHeading(title: string): string | null {
  const match = GOAL_HEADING.exec(title)
  if (!match) return null
  return (match[1] ?? '').trim()
}

export function peelProject(plan: string): { project: string; plan: string } {
  const lines = plan.replace(/\r\n/g, '\n').split('\n')
  const first = lines[0]?.trim() ?? ''
  const match = PROJECT_LINE.exec(first)
  if (!match) return { project: '', plan }
  return {
    project: (match[1] ?? '').trim(),
    plan: lines.slice(1).join('\n').replace(/^\n+/, '').trim(),
  }
}

export function splitGoalBody(body: string): { plan: string; tasksRaw: string } {
  const text = body.replace(/\r\n/g, '\n')
  const sub = TASKS_SUBHEADING.exec(text)
  if (sub && sub.index != null) {
    return {
      plan: text.slice(0, sub.index).replace(/\n+$/, '').trim(),
      tasksRaw: text.slice(sub.index + sub[0].length).replace(/^\n/, ''),
    }
  }
  const lines = text.split('\n')
  const index = lines.findIndex((line) => CHECKBOX_LINE.test(line.trim()))
  if (index === -1) return { plan: text.trim(), tasksRaw: '' }
  return {
    plan: lines.slice(0, index).join('\n').trim(),
    tasksRaw: lines.slice(index).join('\n'),
  }
}

export function parseGoalSection(title: string, body: string): DayGoal {
  const split = splitGoalBody(body)
  const peeled = peelProject(split.plan)
  return { title, project: peeled.project, plan: peeled.plan, tasks: parseTaskList(split.tasksRaw) }
}

export function primaryGoalTitle(goals: DayGoal[]): string {
  return goals.map((goal) => goal.title.trim()).find(Boolean) ?? ''
}

export function allTasks(goals: DayGoal[]): DayTask[] {
  return goals.flatMap((goal) => goal.tasks)
}
