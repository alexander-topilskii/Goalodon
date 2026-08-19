export type DayTask = {
  text: string
  done: boolean
  notes: string[]
}

export type ExtraSection = {
  title: string
  body: string
}

export type DayFile = {
  date: string
  goal: string
  plan: string
  tasks: DayTask[]
  extraFrontmatter: Record<string, unknown>
  extraSections: ExtraSection[]
}

export type DayIndexEntry = {
  goal: string
  total: number
  done: number
  hasContent: boolean
}

export type GraphIndex = {
  generatedAt: string | null
  days: Record<string, DayIndexEntry>
}

export class DayParseError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'DayParseError'
  }
}
