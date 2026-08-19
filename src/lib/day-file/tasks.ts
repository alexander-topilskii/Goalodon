import type { DayTask } from './types.ts'

const CHECKBOX_RE = /^[-*]\s+\[([ xX])\]\s+(.*)$/
const BULLET_RE = /^[-*]\s+(.*)$/
const QUOTE_RE = /^>\s?(.*)$/

export function parseTaskList(raw: string): DayTask[] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n')
  const tasks: DayTask[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const quote = QUOTE_RE.exec(trimmed)
    if (quote) {
      if (tasks.length > 0) {
        tasks[tasks.length - 1].notes.push(quote[1] ?? '')
      }
      continue
    }

    const checkbox = CHECKBOX_RE.exec(trimmed)
    if (checkbox) {
      const mark = checkbox[1] ?? ' '
      tasks.push({
        text: (checkbox[2] ?? '').trimEnd(),
        done: mark !== ' ',
        notes: [],
      })
      continue
    }

    const bullet = BULLET_RE.exec(trimmed)
    if (bullet) {
      tasks.push({
        text: (bullet[1] ?? '').trimEnd(),
        done: false,
        notes: [],
      })
      continue
    }

    tasks.push({ text: trimmed, done: false, notes: [] })
  }

  return tasks
}

export function serializeTaskList(tasks: DayTask[]): string {
  const lines: string[] = []
  for (const task of tasks) {
    const mark = task.done ? 'x' : ' '
    lines.push(`- [${mark}] ${task.text}`)
    for (const note of task.notes) {
      lines.push(`  > ${note}`)
    }
  }
  return lines.join('\n')
}

export function parseAddedTasks(raw: string): DayTask[] {
  return parseTaskList(raw).filter((task) => task.text.trim().length > 0)
}
