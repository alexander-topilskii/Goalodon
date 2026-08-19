import type { DayIndexEntry } from './day-file/types.ts'
import type { DaySnapshot, OverlayEntry, OverlayMap } from './restore.ts'

const OVERLAY_KEY = 'goalodon.indexOverlay'
const DAYS_KEY = 'goalodon.dayCache'
const INDEX_KEY = 'goalodon.graphIndex'
const MAX_DAYS = 40

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch {
    return null
  }
}

function readJson(key: string): unknown {
  const raw = storage()?.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  const store = storage()
  if (!store) return
  try {
    store.setItem(key, JSON.stringify(value))
  } catch {
    /* quota */
  }
}

function asGoals(raw: unknown): OverlayEntry['goals'] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const goal = item as Record<string, unknown>
    return [
      {
        title: typeof goal.title === 'string' ? goal.title : '',
        project: typeof goal.project === 'string' ? goal.project : '',
        total: Number(goal.total) || 0,
        done: Number(goal.done) || 0,
      },
    ]
  })
}

function asOverlayEntry(raw: unknown): OverlayEntry | null {
  if (!raw || typeof raw !== 'object') return null
  const entry = raw as Partial<DayIndexEntry> & { updatedAt?: unknown }
  const updatedAt = Number(entry.updatedAt)
  if (!Number.isFinite(updatedAt)) return null
  return {
    goal: typeof entry.goal === 'string' ? entry.goal : '',
    total: Number(entry.total) || 0,
    done: Number(entry.done) || 0,
    hasContent: Boolean(entry.hasContent),
    goals: asGoals(entry.goals),
    updatedAt,
  }
}

export function loadOverlayMap(): OverlayMap {
  const raw = readJson(OVERLAY_KEY)
  if (!raw || typeof raw !== 'object') return {}
  const next: OverlayMap = {}
  for (const [date, value] of Object.entries(raw as Record<string, unknown>)) {
    const entry = asOverlayEntry(value)
    if (entry) next[date] = entry
  }
  return next
}

export function saveOverlayMap(overlay: OverlayMap) {
  writeJson(OVERLAY_KEY, overlay)
}

function asSnapshot(raw: unknown): DaySnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const snap = raw as Partial<DaySnapshot>
  if (typeof snap.text !== 'string' || typeof snap.sha !== 'string') return null
  const updatedAt = Number(snap.updatedAt)
  if (!Number.isFinite(updatedAt)) return null
  return {
    sha: snap.sha,
    text: snap.text,
    updatedAt,
    confirmed: snap.confirmed !== false,
  }
}

function readDayStore(): Record<string, DaySnapshot> {
  const raw = readJson(DAYS_KEY)
  if (!raw || typeof raw !== 'object') return {}
  const next: Record<string, DaySnapshot> = {}
  for (const [date, value] of Object.entries(raw as Record<string, unknown>)) {
    const snap = asSnapshot(value)
    if (snap) next[date] = snap
  }
  return next
}

function writeDayStore(store: Record<string, DaySnapshot>) {
  const dates = Object.keys(store).sort((a, b) => (store[b]?.updatedAt ?? 0) - (store[a]?.updatedAt ?? 0))
  const trimmed: Record<string, DaySnapshot> = {}
  for (const date of dates.slice(0, MAX_DAYS)) {
    const snap = store[date]
    if (snap) trimmed[date] = snap
  }
  writeJson(DAYS_KEY, trimmed)
}

export function loadDaySnapshot(date: string): DaySnapshot | null {
  return readDayStore()[date] ?? null
}

export function saveDaySnapshot(date: string, snap: DaySnapshot) {
  const store = readDayStore()
  store[date] = snap
  writeDayStore(store)
}

export function loadCachedIndexText(): string | null {
  const raw = storage()?.getItem(INDEX_KEY)
  return raw && raw.trim() ? raw : null
}

export function saveCachedIndexText(text: string | null) {
  const store = storage()
  if (!store) return
  try {
    if (text) store.setItem(INDEX_KEY, text)
    else store.removeItem(INDEX_KEY)
  } catch {
    /* quota */
  }
}
