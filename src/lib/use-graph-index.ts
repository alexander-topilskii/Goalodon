import { useCallback, useEffect, useMemo, useState } from 'react'
import { emptyGraphIndex, parseGraphIndex } from './day-file/graph-index.ts'
import type { GraphIndex } from './day-file/types.ts'
import { createOctokit, getIndexFile, testRepoAccess } from './github/client.ts'
import { isAppError, mapGithubError, type AppError } from './github/errors.ts'
import { useIndexOverlay } from './overlay-context.tsx'
import { useSettings } from './settings-context.tsx'

export function useGraphIndex() {
  const { settings, ready } = useSettings()
  const { merge, clear } = useIndexOverlay()
  const [index, setIndex] = useState<GraphIndex>(emptyGraphIndex)
  const [loading, setLoading] = useState(ready)
  const [fetched, setFetched] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const merged = useMemo(() => merge(index), [merge, index])

  const load = useCallback(async () => {
    if (!ready) return
    setLoading(true)
    setError(null)
    const octokit = createOctokit(settings.token)
    const repo = { owner: settings.owner, repo: settings.repo, branch: settings.branch }
    try {
      await testRepoAccess(octokit, repo)
      const blob = await getIndexFile(octokit, repo)
      clear()
      if (!blob) setIndex(emptyGraphIndex)
      else setIndex(parseGraphIndex(blob.text))
    } catch (err) {
      setError(isAppError(err) ? err : mapGithubError(err))
    } finally {
      setFetched(true)
      setLoading(false)
    }
  }, [ready, settings.token, settings.owner, settings.repo, settings.branch, clear])

  useEffect(() => {
    void load()
  }, [load])

  return { ready, merged, loading, fetched, error, load }
}
