import { parseFrontmatter } from './frontmatter.ts'
import { splitMarkdownSections } from './sections.ts'
import { parseTaskList } from './tasks.ts'
import { DayParseError, type DayFile, type ExtraSection } from './types.ts'

// YAML frontmatter через js-yaml FAILSAFE_SCHEMA: даты остаются строками,
// в бандл не попадает gray-matter (eval + Node Buffer).

const RESERVED_FRONTMATTER = new Set(['date', 'goal'])

export function emptyDayFile(date: string): DayFile {
  return {
    date,
    goal: '',
    plan: '',
    tasks: [],
    extraFrontmatter: {},
    extraSections: [],
  }
}

export function parseDayMarkdown(raw: string, fallbackDate = ''): DayFile {
  try {
    const { data, content } = parseFrontmatter(raw)
    const date = stringifyDate(data.date) || fallbackDate
    const goal = stringifyGoal(data.goal)
    const extraFrontmatter: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (!RESERVED_FRONTMATTER.has(key)) extraFrontmatter[key] = value
    }

    const sections = splitMarkdownSections(content)
    let plan = ''
    let tasksRaw = ''
    const extraSections: ExtraSection[] = []
    let sawPlan = false
    let sawTasks = false

    for (const section of sections) {
      if (section.title === 'План' && !sawPlan) {
        plan = section.body
        sawPlan = true
        continue
      }
      if (section.title === 'Задачи' && !sawTasks) {
        tasksRaw = section.body
        sawTasks = true
        continue
      }
      extraSections.push({ title: section.title, body: section.body })
    }

    if (!sawPlan && extraSections[0]?.title === '') {
      const preamble = extraSections.shift()
      if (preamble) plan = preamble.body
    }

    return {
      date,
      goal,
      plan,
      tasks: parseTaskList(tasksRaw),
      extraFrontmatter,
      extraSections,
    }
  } catch (error) {
    if (error instanceof DayParseError) throw error
    throw new DayParseError('Не удалось разобрать файл дня', { cause: error })
  }
}

function stringifyDate(value: unknown): string {
  if (typeof value === 'string') {
    const iso = value.trim().slice(0, 10)
    return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : value.trim()
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getUTCFullYear()
    const m = String(value.getUTCMonth() + 1).padStart(2, '0')
    const d = String(value.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return ''
}

function stringifyGoal(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return String(value)
}
