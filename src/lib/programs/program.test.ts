import { describe, expect, it } from 'vitest'
import { isDayEmpty } from '../day-file/stats.ts'
import { applyProgramToDay, getProgramDay, programKindTone, tasksFromProgram } from './program.ts'

describe('pull-up program 2026', () => {
  it('maps 25.07 to Saturday GTG sets', () => {
    const day = getProgramDay('2026-07-25')
    expect(day?.kind).toBe('GTG')
    expect(day?.weekday).toBe('Сб')
    expect(day?.sets).toEqual([6, 6, 6, 6, 6, 6])
    expect(day?.description).toContain('1-1.5 часа')
    expect(tasksFromProgram(day!).map((task) => task.text)).toEqual([
      '1 подход: 6 подтягиваний',
      '2 подход: 6 подтягиваний',
      '3 подход: 6 подтягиваний',
      '4 подход: 6 подтягиваний',
      '5 подход: 6 подтягиваний',
      '6 подход: 6 подтягиваний',
    ])
  })

  it('keeps rest days without sets and with a description', () => {
    const applied = applyProgramToDay('2026-08-22')
    expect(applied?.goal).toBe('Отдых')
    expect(applied?.plan).toBe('Полный отдых и восстановление ЦНС и связок.')
    expect(applied?.tasks).toEqual([])
    expect(isDayEmpty(applied!)).toBe(false)
    expect(programKindTone('Отдых')).toBe('rest')
    expect(programKindTone('Отпуск')).toBe('rest')
  })

  it('turns a test target into one task', () => {
    const applied = applyProgramToDay('2026-10-26')
    expect(applied?.goal).toBe('ТЕСТ')
    expect(applied?.tasks).toEqual([{ text: 'ТЕСТ: 30 / 32', done: false, notes: [] }])
    expect(applied?.plan).toContain('Финал.')
    expect(programKindTone('ТЕСТ')).toBe('test')
  })

  it('hydrates today-style volume work', () => {
    const applied = applyProgramToDay('2026-08-19')
    expect(applied?.goal).toBe('Объем')
    expect(applied?.plan).toContain('тенью')
    expect(applied?.tasks.map((task) => task.text)).toEqual([
      '1 подход: 11 подтягиваний',
      '2 подход: 10 подтягиваний',
      '3 подход: 9 подтягиваний',
      '4 подход: 9 подтягиваний',
      '5 подход: 8 подтягиваний',
      '6 подход: 8 подтягиваний',
    ])
  })
})
