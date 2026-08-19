import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseDayMarkdown } from '../day-file/parse.ts'
import { isDayEmpty, statsFromDay } from '../day-file/stats.ts'
import { calendarCellClass, isRestKind, programKindTone } from './program.ts'

const daysDir = path.resolve('data/days')

function loadDay(date: string) {
  const raw = readFileSync(path.join(daysDir, `${date}.md`), 'utf8')
  return parseDayMarkdown(raw, date)
}

function primary(date: string) {
  const goal = loadDay(date).goals[0]
  if (!goal) throw new Error(`no goal in ${date}`)
  return goal
}

describe('pull-up program 2026', () => {
  it('lives as one markdown file per day', () => {
    const names = readdirSync(daysDir)
      .filter((name) => name.endsWith('.md'))
      .sort()
    expect(names).toHaveLength(94)
    expect(names[0]).toBe('2026-07-25.md')
    expect(names.at(-1)).toBe('2026-10-26.md')
  })

  it('maps 25.07 to Saturday GTG sets', () => {
    const goal = primary('2026-07-25')
    expect(goal.title).toBe('GTG')
    expect(goal.project).toBe('Подтягивания')
    expect(goal.plan).toContain('1-1.5 часа')
    expect(goal.tasks.map((task) => task.text)).toEqual([
      '1 подход: 6 подтягиваний',
      '2 подход: 6 подтягиваний',
      '3 подход: 6 подтягиваний',
      '4 подход: 6 подтягиваний',
      '5 подход: 6 подтягиваний',
      '6 подход: 6 подтягиваний',
    ])
    expect(goal.tasks.every((task) => !task.done)).toBe(true)
  })

  it('keeps rest days without sets and with a description', () => {
    const day = loadDay('2026-08-22')
    const goal = primary('2026-08-22')
    expect(goal.title).toBe('Отдых')
    expect(goal.plan).toBe('Полный отдых и восстановление ЦНС и связок.')
    expect(goal.tasks).toEqual([])
    expect(isDayEmpty(day)).toBe(false)
    expect(isRestKind(goal.title)).toBe(true)
    expect(programKindTone('Отдых')).toBe('rest')
    expect(programKindTone('Отпуск')).toBe('rest')
  })

  it('turns a test target into one task', () => {
    const goal = primary('2026-10-26')
    expect(goal.title).toBe('ТЕСТ')
    expect(goal.tasks).toEqual([{ text: 'ТЕСТ: 30 / 32', done: false, notes: [] }])
    expect(goal.plan).toContain('Финал.')
    expect(programKindTone('ТЕСТ')).toBe('test')
  })

  it('hydrates today-style volume work', () => {
    const goal = primary('2026-08-19')
    expect(goal.title).toBe('Объем')
    expect(goal.plan).toContain('тенью')
    expect(goal.tasks.map((task) => task.text)).toEqual([
      '1 подход: 11 подтягиваний',
      '2 подход: 10 подтягиваний',
      '3 подход: 9 подтягиваний',
      '4 подход: 9 подтягиваний',
      '5 подход: 8 подтягиваний',
      '6 подход: 8 подтягиваний',
    ])
  })

  it('keeps already completed GTG days checked', () => {
    const day = loadDay('2026-08-10')
    const goal = primary('2026-08-10')
    expect(goal.title).toBe('GTG')
    expect(goal.tasks).toHaveLength(5)
    expect(goal.tasks.every((task) => task.done)).toBe(true)
    expect(calendarCellClass(statsFromDay(day))).toBe('bg-emerald-700 text-white')
  })

  it('colors unfinished program days by kind, not as generic content', () => {
    expect(calendarCellClass(statsFromDay(loadDay('2026-07-25')))).toBe('bg-sky-100 text-sky-950')
    expect(calendarCellClass(statsFromDay(loadDay('2026-08-19')))).toBe('bg-amber-100 text-amber-950')
    expect(calendarCellClass(statsFromDay(loadDay('2026-08-22')))).toBe('bg-stone-100 text-stone-400')
    expect(calendarCellClass(statsFromDay(loadDay('2026-10-26')))).toBe('bg-rose-100 text-rose-950')
    expect(calendarCellClass(undefined)).toBe('bg-white text-stone-800')
  })
})
