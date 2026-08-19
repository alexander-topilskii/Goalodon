import { describe, expect, it } from 'vitest'
import {
  androidBrowser,
  androidInstallSteps,
  isStandaloneDisplay,
  shouldShowInstallBanner,
} from './install-app.ts'

describe('android install', () => {
  it('detects Chrome on Android before Samsung-like Chrome tokens', () => {
    const chrome =
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
    const samsung =
      'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36'
    expect(androidBrowser(chrome)).toBe('chrome')
    expect(androidBrowser(samsung)).toBe('samsung')
    expect(androidBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBeNull()
  })

  it('explains the Chrome menu path', () => {
    expect(androidInstallSteps('chrome')).toContain('Установить приложение')
    expect(androidInstallSteps(null)).toContain('Chrome на Android')
  })

  it('treats standalone display as already installed', () => {
    expect(isStandaloneDisplay(true, false)).toBe(true)
    expect(isStandaloneDisplay(false, true)).toBe(true)
    expect(isStandaloneDisplay(false, false)).toBe(false)
  })

  it('shows the banner only on Android, and not after dismiss or install', () => {
    expect(
      shouldShowInstallBanner({ standalone: false, dismissed: false, android: true }),
    ).toBe(true)
    expect(
      shouldShowInstallBanner({ standalone: true, dismissed: false, android: true }),
    ).toBe(false)
    expect(
      shouldShowInstallBanner({ standalone: false, dismissed: true, android: true }),
    ).toBe(false)
    expect(
      shouldShowInstallBanner({ standalone: false, dismissed: false, android: false }),
    ).toBe(false)
  })
})
