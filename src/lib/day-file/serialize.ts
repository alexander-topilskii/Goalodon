import { stringifyFrontmatter } from './frontmatter.ts'
import { serializeTaskList } from './tasks.ts'
import type { DayFile } from './types.ts'

export function serializeDayMarkdown(day: DayFile): string {
  const fields: Record<string, unknown> = {
    date: day.date,
    goal: day.goal,
    ...day.extraFrontmatter,
  }

  const parts = [stringifyFrontmatter(fields), '', '## План']
  if (day.plan.trim()) {
    parts.push(day.plan.replace(/\n+$/, ''))
  }
  parts.push('', '## Задачи')
  const tasks = serializeTaskList(day.tasks)
  if (tasks) parts.push(tasks)

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
