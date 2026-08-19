import type { DayIndexEntry, GraphIndex } from './day-file/types.ts'

export type OverlayEntry = DayIndexEntry & { updatedAt: number }
export type OverlayMap = Record<string, OverlayEntry>

export type DaySnapshot = {
  sha: string
  text: string
  updatedAt: number
  confirmed: boolean
}

/** GitHub Contents GET often lags a PUT by minutes. */
export const GITHUB_READ_LAG_MS = 15 * 60 * 1000

export function asIndexEntry(entry: OverlayEntry): DayIndexEntry {
  return {
    goal: entry.goal,
    total: entry.total,
    done: entry.done,
    hasContent: entry.hasContent,
    goals: entry.goals,
  }
}

export function indexEntryEqual(a: DayIndexEntry, b: DayIndexEntry): boolean {
  return (
    a.goal === b.goal &&
    a.total === b.total &&
    a.done === b.done &&
    a.hasContent === b.hasContent &&
    JSON.stringify(a.goals) === JSON.stringify(b.goals)
  )
}

export function mergeOverlay(
  index: GraphIndex,
  overlay: OverlayMap,
): { days: Record<string, DayIndexEntry>; overlay: OverlayMap } {
  const generatedAt = index.generatedAt ? Date.parse(index.generatedAt) : 0
  const nextOverlay: OverlayMap = {}
  const days = { ...index.days }

  for (const [date, entry] of Object.entries(overlay)) {
    const baked = index.days[date]
    const indexEntry = asIndexEntry(entry)
    if (baked && indexEntryEqual(baked, indexEntry)) continue
    if (baked && generatedAt > entry.updatedAt) continue
    nextOverlay[date] = entry
    days[date] = indexEntry
  }

  return { days, overlay: nextOverlay }
}

export function applyOverlay(index: GraphIndex, overlay: OverlayMap): GraphIndex {
  return {
    generatedAt: index.generatedAt,
    days: mergeOverlay(index, overlay).days,
  }
}

export type PickedDay = {
  text: string | null
  writeSha: string | null
  fromCache: boolean
}

export function pickDayRead(
  cache: DaySnapshot | null,
  remote: { sha: string; text: string } | null,
  now = Date.now(),
): PickedDay {
  const fresh = Boolean(cache && now - cache.updatedAt < GITHUB_READ_LAG_MS)

  if (cache && !cache.confirmed) {
    return { text: cache.text, writeSha: cache.sha || null, fromCache: true }
  }

  if (cache && remote && cache.sha && cache.sha === remote.sha) {
    return { text: remote.text, writeSha: remote.sha, fromCache: false }
  }

  if (cache && fresh) {
    return { text: cache.text, writeSha: cache.sha || null, fromCache: true }
  }

  if (remote) {
    return { text: remote.text, writeSha: remote.sha, fromCache: false }
  }

  if (cache) {
    return { text: cache.text, writeSha: cache.sha || null, fromCache: true }
  }

  return { text: null, writeSha: null, fromCache: false }
}
