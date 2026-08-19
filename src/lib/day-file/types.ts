export type DayTask = {
  text: string
  done: boolean
  notes: string[]
}

export type DayGoal = {
  title: string
  project: string
  plan: string
  tasks: DayTask[]
}

export type ExtraSection = {
  title: string
  body: string
}

export type DayFile = {
  date: string
  goals: DayGoal[]
  extraFrontmatter: Record<string, unknown>
  extraSections: ExtraSection[]
}

export type GoalIndexEntry = {
  title: string
  project: string
  total: number
  done: number
}

export type DayIndexEntry = {
  goal: string
  total: number
  done: number
  hasContent: boolean
  goals: GoalIndexEntry[]
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
