import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { DayIndexEntry, GraphIndex } from './day-file/types.ts'

type OverlayContextValue = {
  overlay: Record<string, DayIndexEntry>
  patch: (date: string, entry: DayIndexEntry) => void
  clear: () => void
  merge: (index: GraphIndex) => GraphIndex
}

const OverlayContext = createContext<OverlayContextValue | null>(null)

export function IndexOverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<Record<string, DayIndexEntry>>({})

  const patch = useCallback((date: string, entry: DayIndexEntry) => {
    setOverlay((prev) => ({ ...prev, [date]: entry }))
  }, [])

  const clear = useCallback(() => setOverlay({}), [])

  const merge = useCallback(
    (index: GraphIndex): GraphIndex => ({
      generatedAt: index.generatedAt,
      days: { ...index.days, ...overlay },
    }),
    [overlay],
  )

  const value = useMemo(
    () => ({ overlay, patch, clear, merge }),
    [overlay, patch, clear, merge],
  )

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>
}

export function useIndexOverlay(): OverlayContextValue {
  const ctx = useContext(OverlayContext)
  if (!ctx) throw new Error('IndexOverlayProvider is missing')
  return ctx
}
