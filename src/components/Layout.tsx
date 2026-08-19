import { useCallback, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { InstallBanner } from './InstallApp.tsx'
import { TabBar } from './TabBar.tsx'
import { installBannerPadding } from '../lib/install-app.ts'

export function Layout() {
  const [banner, setBanner] = useState(false)
  const onBanner = useCallback((show: boolean) => setBanner(show), [])

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-baseline justify-between px-4 pb-1 pt-[max(1rem,env(safe-area-inset-top))]">
        <Link to="/" className="text-lg font-semibold tracking-tight text-stone-900">
          Goalodon
        </Link>
      </header>
      <main className={`flex-1 px-4 pt-2 ${installBannerPadding(banner)}`}>
        <Outlet />
      </main>
      <InstallBanner onVisibilityChange={onBanner} />
      <TabBar />
    </div>
  )
}
