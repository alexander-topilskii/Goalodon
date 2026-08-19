import { stringifyFrontmatter } from './frontmatter.ts'
import { serializeTaskList } from './tasks.ts'
import type { DayFile } from './types.ts'

export function serializeDayMarkdown(day: DayFile): string {
  const fields: Record<string, unknown> = {
    date: day.date,
    ...day.extraFrontmatter,
  }

  const parts = [stringifyFrontmatter(fields)]

  for (const goal of day.goals) {
    parts.push('', `## Цель: ${goal.title}`)
    if (goal.project.trim()) {
      parts.push(`Проект: ${goal.project.trim()}`)
    }
    if (goal.plan.trim()) {
      if (goal.project.trim()) parts.push('')
      parts.push(goal.plan.replace(/\n+$/, ''))
    }
    parts.push('', '### Задачи')
    const tasks = serializeTaskList(goal.tasks)
    if (tasks) parts.push(tasks)
  }

  for (const section of day.extraSections) {
    parts.push('')
    if (section.title) {
      parts.push(`## ${section.title}`)
      if (section.body) parts.push(section.body.replace(/\n+$/, ''))
    } else if (section.body) {
      parts.push(section.body.replace(/\n+$/, ''))
    }
  }

  return `${parts.join('\n').replace(/\n+$/, '')}\n`
}
