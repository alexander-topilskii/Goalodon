import { useCallback, useEffect, useState } from 'react'
import {
  androidBrowser,
  readStandalone,
  type BeforeInstallPromptEvent,
} from './install-app.ts'

export function useAppInstall() {
  const [standalone, setStandalone] = useState(() =>
    typeof window === 'undefined' ? false : readStandalone(window),
  )
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [busy, setBusy] = useState(false)
  const android = typeof navigator === 'undefined' ? null : androidBrowser(navigator.userAgent)

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setDeferred(null)
      setStandalone(true)
    }
    const onDisplay = () => setStandalone(readStandalone(window))

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    const media = window.matchMedia('(display-mode: standalone)')
    media.addEventListener('change', onDisplay)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      media.removeEventListener('change', onDisplay)
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferred) return false
    setBusy(true)
    try {
      await deferred.prompt()
      const choice = await deferred.userChoice
      setDeferred(null)
      if (choice.outcome === 'accepted') setStandalone(true)
      return choice.outcome === 'accepted'
    } finally {
      setBusy(false)
    }
  }, [deferred])

  return {
    standalone,
    canPrompt: Boolean(deferred),
    busy,
    install,
    android,
  }
}
