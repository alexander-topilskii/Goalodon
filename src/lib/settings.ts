import { detectRepo } from './github/repo.ts'

const TOKEN = 'goalodon.token'
const OWNER = 'goalodon.owner'
const REPO = 'goalodon.repo'
const BRANCH = 'goalodon.branch'
const CALENDAR = 'goalodon.calendar'

export type CalendarView = 'month' | 'year'

export type CalendarState = {
  year: number
  month: number
  view: CalendarView
}

export type AppSettings = {
  token: string
  owner: string
  repo: string
  branch: string
}

const REPO_NAME = /^[\w.-]+$/

export function isValidOwnerRepo(owner: string, repo: string): boolean {
  return REPO_NAME.test(owner) && REPO_NAME.test(repo)
}

export function loadSettings(): AppSettings {
  const detected = detectRepo()
  return {
    token: localStorage.getItem(TOKEN) ?? '',
    owner: localStorage.getItem(OWNER) || detected.owner,
    repo: localStorage.getItem(REPO) || detected.repo,
    branch: localStorage.getItem(BRANCH) || detected.branch || 'main',
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(OWNER, settings.owner.trim())
  localStorage.setItem(REPO, settings.repo.trim())
  localStorage.setItem(BRANCH, settings.branch.trim() || 'main')
  if (settings.token) localStorage.setItem(TOKEN, settings.token)
}

export function saveToken(token: string) {
  if (token) localStorage.setItem(TOKEN, token)
  else localStorage.removeItem(TOKEN)
}

export function clearToken() {
  localStorage.removeItem(TOKEN)
}

export function loadCalendarState(fallback: CalendarState): CalendarState {
  const raw = localStorage.getItem(CALENDAR)
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw) as Partial<CalendarState>
    const year = Number(parsed.year)
    const month = Number(parsed.month)
    const view = parsed.view === 'year' ? 'year' : 'month'
    if (!Number.isInteger(year) || month < 1 || month > 12) return fallback
    return { year, month, view }
  } catch {
    return fallback
  }
}

export function saveCalendarState(state: CalendarState) {
  localStorage.setItem(CALENDAR, JSON.stringify(state))
}

export function maskToken(token: string): string {
  if (token.length < 8) return token ? '••••' : ''
  return `${token.slice(0, 4)}…${token.slice(-4)}`
}

export function settingsReady(settings: AppSettings): boolean {
  return Boolean(settings.token && isValidOwnerRepo(settings.owner, settings.repo) && settings.branch)
}
