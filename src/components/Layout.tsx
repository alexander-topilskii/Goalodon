import { Link, Outlet } from 'react-router-dom'
import { TabBar } from './TabBar.tsx'

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-baseline justify-between px-4 pb-1 pt-4">
        <Link to="/" className="text-lg font-semibold tracking-tight text-stone-900">
          Goalodon
        </Link>
      </header>
      <main className="flex-1 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-2">
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}
