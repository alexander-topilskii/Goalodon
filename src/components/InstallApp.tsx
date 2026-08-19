import { useEffect, useState } from 'react'
import {
  androidInstallSteps,
  loadInstallBannerDismissed,
  saveInstallBannerDismissed,
  shouldShowInstallBanner,
} from '../lib/install-app.ts'
import { useAppInstall } from '../lib/use-app-install.ts'

export function InstallAppCard() {
  const { standalone, canPrompt, busy, install, android } = useAppInstall()

  if (standalone) {
    return (
      <div className="rounded-2xl bg-white p-4 text-sm text-stone-700">
        <h2 className="text-base font-semibold text-stone-900">Приложение</h2>
        <p className="mt-1 text-stone-600">Уже на главном экране, открыто без браузера.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-4 text-sm text-stone-700">
      <h2 className="text-base font-semibold text-stone-900">Приложение на телефоне</h2>
      <p className="mt-1 leading-relaxed text-stone-600">
        Установите Goalodon на Android — иконка на рабочем столе, без адресной строки Chrome.
      </p>
      {canPrompt ? (
        <button
          type="button"
          className="mt-3 min-h-12 w-full rounded-2xl bg-stone-900 text-sm font-medium text-white disabled:opacity-60"
          disabled={busy}
          onClick={() => void install()}
        >
          {busy ? 'Устанавливаем…' : 'Установить'}
        </button>
      ) : (
        <p className="mt-3 rounded-xl bg-stone-100 px-3 py-2 leading-relaxed text-stone-700">
          {androidInstallSteps(android)}
        </p>
      )}
    </div>
  )
}

export function InstallBanner({
  onVisibilityChange,
}: {
  onVisibilityChange?: (show: boolean) => void
}) {
  const install = useAppInstall()
  const [dismissed, setDismissed] = useState(loadInstallBannerDismissed)
  const show = shouldShowInstallBanner({
    standalone: install.standalone,
    dismissed,
    android: Boolean(install.android),
  })

  useEffect(() => {
    onVisibilityChange?.(show)
    return () => onVisibilityChange?.(false)
  }, [show, onVisibilityChange])

  if (!show) return null

  return (
    <div
      className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-1/2 z-30 w-full max-w-[32rem] -translate-x-1/2 px-4 pb-2"
      role="region"
      aria-label="Установить приложение"
    >
      <div className="flex items-center gap-2 rounded-2xl bg-stone-900 px-3 py-2 text-white shadow-lg">
        <p className="min-w-0 flex-1 text-sm leading-snug">На главный экран Android</p>
        {install.canPrompt ? (
          <button
            type="button"
            className="min-h-11 shrink-0 rounded-xl bg-white px-3 text-sm font-medium text-stone-900 disabled:opacity-60"
            disabled={install.busy}
            onClick={() => void install.install()}
          >
            Установить
          </button>
        ) : (
          <span className="max-w-[9.5rem] shrink-0 text-right text-[11px] leading-tight text-stone-300">
            Меню ⋮ → Установить
          </span>
        )}
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-stone-400"
          aria-label="Скрыть"
          onClick={() => {
            saveInstallBannerDismissed()
            setDismissed(true)
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}
