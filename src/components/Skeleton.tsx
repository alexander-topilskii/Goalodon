import { WEEKDAYS } from '../lib/dates.ts'

export function Bone({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-stone-200 ${className}`.trim()} aria-hidden />
}

export function CalendarSkeleton({ yearView = false }: { yearView?: boolean }) {
  const months = yearView ? 12 : 1
  return (
    <div role="status" aria-live="polite" aria-label="Загружаем календарь">
      <div className={yearView ? 'flex flex-col gap-6' : ''}>
        {Array.from({ length: months }, (_, month) => (
          <div key={month}>
            {yearView ? <Bone className="mb-2 h-4 w-28" /> : null}
            <WeekdayRow compact={yearView} />
            <div className={`grid grid-cols-7 ${yearView ? 'gap-0.5' : 'gap-1'}`}>
              {Array.from({ length: 42 }, (_, cell) => (
                <Bone key={cell} className={yearView ? 'h-7 rounded-lg' : 'min-h-12 rounded-lg'} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Загружаем календарь</span>
    </div>
  )
}

export function DaySkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-live="polite" aria-label="Загружаем день">
      {Array.from({ length: 2 }, (_, card) => (
        <div key={card} className="flex flex-col gap-3 rounded-3xl bg-white p-3 shadow-sm">
          <Bone className="h-16 w-full rounded-2xl" />
          <Bone className="h-20 w-full rounded-2xl" />
          <ul className="flex flex-col gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              <li key={index} className="rounded-2xl bg-[#fbf8f3] px-3 py-3">
                <div className="flex items-center gap-3">
                  <Bone className="h-6 w-6 rounded-md" />
                  <Bone className="h-4 flex-1" />
                </div>
              </li>
            ))}
          </ul>
          <Bone className="h-12 w-full rounded-2xl" />
        </div>
      ))}
      <Bone className="h-12 w-full rounded-2xl" />
      <span className="sr-only">Загружаем день</span>
    </div>
  )
}

export function ProjectsSkeleton() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-live="polite" aria-label="Загружаем проекты">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="rounded-3xl bg-white p-4 shadow-sm">
          <Bone className="h-5 w-40" />
          <Bone className="mt-2 h-4 w-56" />
          <Bone className="mt-3 h-1.5 w-full rounded-full" />
        </div>
      ))}
      <span className="sr-only">Загружаем проекты</span>
    </div>
  )
}

function WeekdayRow({ compact }: { compact: boolean }) {
  return (
    <div className={`grid grid-cols-7 ${compact ? 'mb-1 gap-0.5' : 'mb-2 gap-1'}`}>
      {WEEKDAYS.map((day) => (
        <div key={day} className="text-center text-[10px] uppercase tracking-wide text-stone-300">
          {day}
        </div>
      ))}
    </div>
  )
}
