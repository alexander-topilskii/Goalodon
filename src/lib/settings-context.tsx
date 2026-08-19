import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  clearToken,
  loadSettings,
  saveSettings,
  saveToken,
  settingsReady,
  type AppSettings,
} from './settings.ts'

type SettingsContextValue = {
  settings: AppSettings
  ready: boolean
  update: (next: AppSettings) => void
  logout: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      ready: settingsReady(settings),
      update: (next) => {
        saveSettings(next)
        if (next.token) saveToken(next.token)
        setSettings({
          token: next.token || loadSettings().token,
          owner: next.owner.trim(),
          repo: next.repo.trim(),
          branch: next.branch.trim() || 'main',
        })
      },
      logout: () => {
        clearToken()
        setSettings((prev) => ({ ...prev, token: '' }))
      },
    }),
    [settings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('SettingsProvider is missing')
  return ctx
}
