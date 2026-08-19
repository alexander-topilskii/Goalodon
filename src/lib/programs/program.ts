import type { DayFile, DayTask } from '../day-file/types.ts'
import { emptyDayFile } from '../day-file/parse.ts'
import pullups from './pullups-2026.json'

export type ProgramSet = number | string

export type ProgramDay = {
  date: string
  weekday: string
  kind: string
  sets: ProgramSet[]
  description: string
}

export type ProgramKindTone = 'rest' | 'test' | 'gtg' | 'work'

const REST_KINDS = new Set(['Отдых', 'Отпуск'])

const DAYS_BY_DATE = new Map<string, ProgramDay>(
  (pullups.days as ProgramDay[]).map((day) => [day.date, day]),
)

export function getProgramDay(date: string): ProgramDay | undefined {
  return DAYS_BY_DATE.get(date)
}

export function programKindTone(kind: string): ProgramKindTone {
  if (REST_KINDS.has(kind)) return 'rest'
  if (kind === 'ТЕСТ') return 'test'
  if (kind === 'GTG') return 'gtg'
  return 'work'
}

export function tasksFromProgram(day: ProgramDay): DayTask[] {
  if (day.kind === 'ТЕСТ') {
    const target = day.sets[0]
    const label = target == null ? 'ТЕСТ' : `ТЕСТ: ${target}`
    return [{ text: label, done: false, notes: [] }]
  }
  return day.sets.map((reps, index) => ({
    text: `${index + 1} подход: ${reps} подтягиваний`,
    done: false,
    notes: [],
  }))
}

export function applyProgramToDay(date: string): DayFile | null {
  const program = getProgramDay(date)
  if (!program) return null
  const tasks = tasksFromProgram(program)
  return {
    ...emptyDayFile(date),
    goal: program.kind,
    plan: program.description,
    tasks,
  }
}
