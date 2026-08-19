import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { localISODate } from '../lib/dates.ts'
import { loadCalendarState } from '../lib/settings.ts'

const itemClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
    isActive ? 'text-stone-900' : 'text-stone-400',
  ].join(' ')

function calendarHref(): string {
  const now = localISODate()
  const fallback = {
    year: Number(now.slice(0, 4)),
    month: Number(now.slice(5, 7)),
    view: 'month' as const,
  }
  const stored = loadCalendarState(fallback)
  if (stored.view === 'year') return `/?view=year&year=${stored.year}`
  return `/?month=${stored.year}-${String(stored.month).padStart(2, '0')}`
}

export function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const today = localISODate()
  const onToday = location.pathname === `/day/${today}`

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-20 w-full max-w-[32rem] -translate-x-1/2 border-t border-stone-200 bg-[#fbf8f3]/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-16 items-stretch px-2">
        <NavLink to={calendarHref()} className={itemClass} end>
          Календарь
        </NavLink>
        <button
          type="button"
          className={itemClass({ isActive: onToday })}
          onClick={() => navigate(`/day/${today}`)}
        >
          Сегодня
        </button>
        <NavLink to="/settings" className={itemClass}>
          Настройки
        </NavLink>
      </div>
    </nav>
  )
}
