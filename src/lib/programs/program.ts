import type { DayIndexEntry } from '../day-file/types.ts'

export type ProgramKindTone = 'rest' | 'test' | 'gtg' | 'work'

const REST_KINDS = new Set(['Отдых', 'Отпуск'])

export function isRestKind(kind: string): boolean {
  return REST_KINDS.has(kind)
}

export function programKindTone(kind: string): ProgramKindTone {
  if (REST_KINDS.has(kind)) return 'rest'
  if (kind === 'ТЕСТ') return 'test'
  if (kind === 'GTG') return 'gtg'
  return 'work'
}

export function calendarCellClass(entry: DayIndexEntry | undefined): string {
  if (!entry?.hasContent) return 'bg-white text-stone-800'
  if (entry.total > 0 && entry.done === entry.total) return 'bg-emerald-700 text-white'
  const tone = programKindTone(entry.goal)
  if (tone === 'rest') return 'bg-stone-100 text-stone-400'
  if (tone === 'test') return 'bg-rose-100 text-rose-950'
  if (tone === 'gtg') return 'bg-sky-100 text-sky-950'
  return 'bg-amber-100 text-amber-950'
}
