import { describe, expect, it } from 'vitest'
import colonGoal from './fixtures/colon-goal.md?raw'
import emptyDay from './fixtures/empty.md?raw'
import example from './fixtures/example.md?raw'
import extraSection from './fixtures/extra-section.md?raw'
import goalOnly from './fixtures/goal-only.md?raw'
import markers from './fixtures/markers.md?raw'
import multiNotes from './fixtures/multi-notes.md?raw'
import twoGoals from './fixtures/two-goals.md?raw'
import { parseAddedTasks } from './tasks.ts'
import { parseDayMarkdown } from './parse.ts'
import { serializeDayMarkdown } from './serialize.ts'
import { statsFromDay } from './stats.ts'
import type { DayFile } from './types.ts'

function modelOf(raw: string, date?: string): DayFile {
  return parseDayMarkdown(raw, date)
}

function roundTrip(day: DayFile): DayFile {
  return parseDayMarkdown(serializeDayMarkdown(day), day.date)
}

describe('parseDayMarkdown', () => {
  it('parses the spec example as one goal', () => {
    const day = modelOf(example)
    expect(day.date).toBe('2026-08-19')
    expect(day.goals).toEqual([
      {
        title: 'Спроектировать структуру базы данных в Git',
        project: '',
        plan: 'Закончить с архитектурой до обеда, вечером пойти на тренировку.',
        tasks: [
          { text: 'Греческий язык (перевод диалогов)', done: true, notes: [] },
          { text: '1 подход: 10 чистых подтягиваний', done: true, notes: ['Отдых 3 минуты'] },
          { text: '2 подход: 9 подтягиваний', done: false, notes: ['Отдых 2 минуты'] },
        ],
      },
    ])
    expect(statsFromDay(day)).toMatchObject({ total: 3, done: 2, hasContent: true })
  })

  it('parses several named goals with their own tasks', () => {
    const day = modelOf(twoGoals)
    expect(day.goals).toHaveLength(2)
    expect(day.goals[0]?.title).toBe('Объем')
    expect(day.goals[0]?.project).toBe('Подтягивания')
    expect(day.goals[1]?.title).toBe('Греческий')
    expect(day.goals[1]?.project).toBe('')
    expect(day.goals[0]?.tasks.map((task) => task.text)).toEqual([
      '1 подход: 10 подтягиваний',
      '2 подход: 8 подтягиваний',
    ])
    expect(day.goals[1]?.tasks).toEqual([
      { text: 'Перевод диалогов', done: false, notes: ['Урок 4'] },
    ])
    expect(statsFromDay(day)).toMatchObject({ goal: 'Объем', total: 3, done: 1, hasContent: true })
  })

  it('parses an empty day', () => {
    const day = modelOf(emptyDay)
    expect(day.goals).toEqual([])
    expect(statsFromDay(day).hasContent).toBe(false)
  })

  it('parses a goal-only day', () => {
    const day = modelOf(goalOnly)
    expect(day.goals).toEqual([{ title: 'Только цель', project: '', plan: '', tasks: [] }])
    expect(statsFromDay(day).hasContent).toBe(true)
  })

  it('accepts [X] and * bullets', () => {
    const day = modelOf(markers)
    expect(day.goals[0]?.tasks.map((task) => ({ text: task.text, done: task.done }))).toEqual([
      { text: 'Большой икс', done: true },
      { text: 'Звёздочка', done: false },
    ])
  })

  it('parses CRLF files', () => {
    const day = modelOf(example.replaceAll('\n', '\r\n'))
    expect(day.goals[0]?.tasks).toHaveLength(3)
    expect(day.goals[0]?.tasks[1]?.notes).toEqual(['Отдых 3 минуты'])
  })

  it('keeps extra frontmatter and extra sections', () => {
    const day = modelOf(extraSection)
    expect(day.extraFrontmatter.custom).toBe('yes')
    expect(day.extraSections).toEqual([{ title: 'Заметки', body: 'keep me' }])
    const again = roundTrip(day)
    expect(again.extraFrontmatter.custom).toBe('yes')
    expect(again.extraSections).toEqual([{ title: 'Заметки', body: 'keep me' }])
  })

  it('keeps a colon in the goal', () => {
    const day = modelOf(colonGoal)
    expect(day.goals[0]?.title).toBe('Спроектировать: структура и API')
    expect(roundTrip(day).goals[0]?.title).toBe(day.goals[0]?.title)
  })

  it('keeps several notes on one task', () => {
    const day = modelOf(multiNotes)
    expect(day.goals[0]?.tasks[0]?.notes).toEqual(['Отдых 3 минуты', 'Вода'])
  })
})

describe('serializeDayMarkdown', () => {
  it('round-trips the spec example model', () => {
    const day = modelOf(example)
    expect(roundTrip(day)).toEqual(day)
  })

  it('round-trips several goals', () => {
    const day = modelOf(twoGoals)
    expect(roundTrip(day)).toEqual(day)
  })

  it('writes named goal headings instead of frontmatter goal', () => {
    const text = serializeDayMarkdown(modelOf(example))
    expect(text).toContain('## Цель: Спроектировать структуру базы данных в Git')
    expect(text).not.toMatch(/^goal:/m)
  })

  it('is stable on a second serialize', () => {
    const first = serializeDayMarkdown(modelOf(example))
    const second = serializeDayMarkdown(parseDayMarkdown(first))
    expect(second).toBe(first)
  })

  it('writes canonical checkboxes and quoted notes', () => {
    const text = serializeDayMarkdown(modelOf(markers))
    expect(text).toContain('- [x] Большой икс')
    expect(text).toContain('- [ ] Звёздочка')
  })
})

describe('parseAddedTasks', () => {
  it('accepts checklist, quotes and plain lines', () => {
    const tasks = parseAddedTasks(
      ['- [ ] 3 подход: 8 подтягиваний', '  > Отдых 2 минуты', 'Греческий: карточки', ''].join('\n'),
    )
    expect(tasks).toEqual([
      { text: '3 подход: 8 подтягиваний', done: false, notes: ['Отдых 2 минуты'] },
      { text: 'Греческий: карточки', done: false, notes: [] },
    ])
  })
})
