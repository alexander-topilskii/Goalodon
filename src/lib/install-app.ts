const DISMISS_KEY = 'goalodon.installBanner'

export type AndroidBrowser = 'chrome' | 'samsung' | 'firefox' | 'other'

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function isStandaloneDisplay(
  standaloneMedia: boolean,
  navigatorStandalone = false,
): boolean {
  return standaloneMedia || navigatorStandalone
}

export function readStandalone(win: Window): boolean {
  const standalone = win.matchMedia('(display-mode: standalone)').matches
  const minimal = win.matchMedia('(display-mode: minimal-ui)').matches
  const nav = win.navigator as Navigator & { standalone?: boolean }
  return isStandaloneDisplay(standalone || minimal, nav.standalone === true)
}

export function androidBrowser(ua: string): AndroidBrowser | null {
  if (!/android/i.test(ua)) return null
  if (/samsungbrowser/i.test(ua)) return 'samsung'
  if (/firefox|fxios/i.test(ua)) return 'firefox'
  if (/chrome|chromium|edg/i.test(ua)) return 'chrome'
  return 'other'
}

export function androidInstallSteps(browser: AndroidBrowser | null): string {
  if (browser === 'samsung') return 'Меню (⋮) → Добавить страницу на → Главный экран.'
  if (browser === 'firefox') return 'Меню (⋮) → Установить.'
  if (browser === 'chrome') return 'Меню Chrome (⋮) → Установить приложение.'
  if (browser === 'other') {
    return 'В меню браузера выберите «Добавить на главный экран» или «Установить приложение».'
  }
  return 'Откройте сайт в Chrome на Android: меню (⋮) → «Установить приложение».'
}

export function shouldShowInstallBanner(opts: {
  standalone: boolean
  dismissed: boolean
  android: boolean
}): boolean {
  return !opts.standalone && !opts.dismissed && opts.android
}

export function installBannerPadding(show: boolean): string {
  return show
    ? 'pb-[calc(9.75rem+env(safe-area-inset-bottom))]'
    : 'pb-[calc(5.5rem+env(safe-area-inset-bottom))]'
}

export function loadInstallBannerDismissed(): boolean {
  return localStorage.getItem(DISMISS_KEY) === '1'
}

export function saveInstallBannerDismissed() {
  localStorage.setItem(DISMISS_KEY, '1')
}
