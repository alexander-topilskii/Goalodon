import { useCallback, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ErrorBanner, NeedSetup } from '../components/Feedback.tsx'
import { CalendarSkeleton } from '../components/Skeleton.tsx'
import {
  localISODate,
  monthCells,
  monthLabel,
  parseYearMonth,
  shiftMonth,
  WEEKDAYS,
} from '../lib/dates.ts'
import { calendarCellClass } from '../lib/programs/program.ts'
import type { CalendarState } from '../lib/settings.ts'
import type { DayIndexEntry } from '../lib/day-file/types.ts'
import { loadCalendarState, saveCalendarState } from '../lib/settings.ts'
import { useGraphIndex } from '../lib/use-graph-index.ts'

function resolveState(params: URLSearchParams, fallback: CalendarState): CalendarState {
  const monthFromUrl = parseYearMonth(params.get('month') ?? '')
  const yearParam = Number(params.get('year'))
  if (params.get('view') === 'year') {
    return {
      view: 'year',
      year: Number.isInteger(yearParam) && yearParam > 1970 ? yearParam : fallback.year,
      month: fallback.month,
    }
  }
  if (monthFromUrl) {
    return { view: 'month', ...monthFromUrl }
  }
  return fallback
}

export function CalendarPage() {
  const { ready, merged, loading, fetched, error, load } = useGraphIndex()
  const [params, setParams] = useSearchParams()
  const today = localISODate()
  const todayParts = parseYearMonth(today.slice(0, 7)) ?? { year: 2026, month: 1 }
  const fallback = loadCalendarState({ ...todayParts, view: 'month' })
  const state = resolveState(params, fallback)

  const setView = useCallback(
    (next: CalendarState) => {
      saveCalendarState(next)
      const nextParams = new URLSearchParams()
      if (next.view === 'year') {
        nextParams.set('view', 'year')
        nextParams.set('year', String(next.year))
      } else {
        nextParams.set('month', `${next.year}-${String(next.month).padStart(2, '0')}`)
      }
      setParams(nextParams, { replace: true })
    },
    [setParams],
  )

  useEffect(() => {
    if (!params.get('month') && params.get('view') !== 'year') {
      setView(fallback)
    }
    // Hydrate the URL once when opened without query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ready) return <NeedSetup />

  const { year, month, view } = state

  return (
    <section className="flex flex-col gap-4" aria-busy={loading}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-xl text-stone-600"
            aria-label="Назад"
            onClick={() =>
              view === 'year'
                ? setView({ year: year - 1, month, view: 'year' })
                : setView({ ...shiftMonth(year, month, -1), view: 'month' })
            }
          >
            ‹
          </button>
          <h1 className="min-w-[12ch] text-center text-lg font-semibold capitalize">
            {view === 'year' ? year : monthLabel(year, month)}
          </h1>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-xl text-stone-600"
            aria-label="Вперёд"
            onClick={() =>
              view === 'year'
                ? setView({ year: year + 1, month, view: 'year' })
                : setView({ ...shiftMonth(year, month, 1), view: 'month' })
            }
          >
            ›
          </button>
        </div>
        <button
          type="button"
          className="min-h-11 rounded-xl px-3 text-sm font-medium text-stone-700"
          onClick={() => setView({ year, month, view: view === 'year' ? 'month' : 'year' })}
        >
          {view === 'year' ? 'Месяц' : 'Год'}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="min-h-11 rounded-xl bg-stone-900 px-3 text-sm font-medium text-white"
          onClick={() => setView({ ...todayParts, view: 'month' })}
        >
          Сегодня
        </button>
        <button
          type="button"
          className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 text-sm font-medium disabled:opacity-60"
          disabled={loading}
          onClick={() => void load()}
        >
          {loading && fetched ? 'Обновляем…' : 'Обновить'}
        </button>
      </div>

      {error ? <ErrorBanner message={error.message} actionLabel="Повторить" onAction={() => void load()} /> : null}

      {loading && !fetched ? (
        <CalendarSkeleton yearView={view === 'year'} />
      ) : view === 'year' ? (
        <div className="flex flex-col gap-6">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <button key={m} type="button" className="text-left" onClick={() => setView({ year, month: m, view: 'month' })}>
              <h2 className="mb-2 text-sm font-semibold capitalize text-stone-600">{monthLabel(year, m)}</h2>
              <MonthGrid year={year} month={m} today={today} days={merged.days} compact />
            </button>
          ))}
        </div>
      ) : (
        <MonthGrid year={year} month={month} today={today} days={merged.days} />
      )}
    </section>
  )
}

function MonthGrid({
  year,
  month,
  today,
  days,
  compact = false,
}: {
  year: number
  month: number
  today: string
  days: Record<string, DayIndexEntry>
  compact?: boolean
}) {
  const cells = monthCells(year, month)
  return (
    <div>
      <div className={`grid grid-cols-7 ${compact ? 'mb-1 gap-0.5' : 'mb-2 gap-1'}`}>
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-[10px] uppercase tracking-wide text-stone-400">
            {day}
          </div>
        ))}
      </div>
      <div className={`grid grid-cols-7 ${compact ? 'gap-0.5' : 'gap-1'}`}>
        {cells.map((cell) => {
          const entry = days[cell.date]
          const status = entry?.hasContent
            ? entry.total > 0
              ? `${entry.done} из ${entry.total}`
              : entry.goal || 'есть запись'
            : 'нет записи'
          const inner = (
            <span
              className={[
                'flex flex-col items-center justify-center rounded-lg font-medium',
                compact ? 'h-7 text-[10px]' : 'min-h-12 px-0.5 py-1 text-sm',
                cell.inMonth ? calendarCellClass(entry) : 'bg-transparent text-stone-300',
                cell.date === today ? 'ring-2 ring-stone-900 ring-offset-1 ring-offset-[#fbf8f3]' : '',
              ].join(' ')}
            >
              {Number(cell.date.slice(8, 10))}
              {!compact && cell.inMonth && entry?.goal ? (
                <span className="max-w-full truncate text-[8px] font-medium leading-tight opacity-80">
                  {entry.goal}
                </span>
              ) : null}
            </span>
          )
          if (compact) {
            return (
              <span key={cell.date} aria-hidden>
                {inner}
              </span>
            )
          }
          return (
            <Link key={cell.date} to={`/day/${cell.date}`} aria-label={`${cell.date}, ${status}`} className="block">
              {inner}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
