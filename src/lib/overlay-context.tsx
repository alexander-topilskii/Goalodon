import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { DayIndexEntry, GraphIndex } from './day-file/types.ts'
import { loadOverlayMap, saveOverlayMap } from './local-state.ts'
import { applyOverlay, mergeOverlay, type OverlayMap } from './restore.ts'

type OverlayContextValue = {
  overlay: OverlayMap
  patch: (date: string, entry: DayIndexEntry) => void
  reconcile: (index: GraphIndex) => void
  merge: (index: GraphIndex) => GraphIndex
}

const OverlayContext = createContext<OverlayContextValue | null>(null)

export function IndexOverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<OverlayMap>(() => loadOverlayMap())

  const patch = useCallback((date: string, entry: DayIndexEntry) => {
    setOverlay((prev) => {
      const next = { ...prev, [date]: { ...entry, updatedAt: Date.now() } }
      saveOverlayMap(next)
      return next
    })
  }, [])

  const reconcile = useCallback((index: GraphIndex) => {
    setOverlay((prev) => {
      const next = mergeOverlay(index, prev).overlay
      saveOverlayMap(next)
      return next
    })
  }, [])

  const merge = useCallback(
    (index: GraphIndex): GraphIndex => applyOverlay(index, overlay),
    [overlay],
  )

  const value = useMemo(
    () => ({ overlay, patch, reconcile, merge }),
    [overlay, patch, reconcile, merge],
  )

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>
}

export function useIndexOverlay(): OverlayContextValue {
  const ctx = useContext(OverlayContext)
  if (!ctx) throw new Error('IndexOverlayProvider is missing')
  return ctx
}
