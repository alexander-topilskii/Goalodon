import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  emptyDayFile,
  isDayEmpty,
  parseDayMarkdown,
  serializeDayMarkdown,
  statsFromDay,
  type DayFile,
  type DayTask,
} from './day-file/index.ts'
import { createOctokit, dayFilePath, getFile, putFile, type RepoRef } from './github/client.ts'
import { isAppError, mapGithubError, type AppError } from './github/errors.ts'
import { useIndexOverlay } from './overlay-context.tsx'
import { useSettings } from './settings-context.tsx'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useDayFile(date: string) {
  const { settings, ready } = useSettings()
  const { patch } = useIndexOverlay()
  const [day, setDay] = useState<DayFile>(() => emptyDayFile(date))
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<AppError | null>(null)
  const [saveError, setSaveError] = useState<AppError | null>(null)
  const [status, setStatus] = useState<SaveStatus>('idle')

  const shaRef = useRef<string | null>(null)
  const pendingRef = useRef<DayFile | null>(null)
  const inFlightRef = useRef(false)
  const dayRef = useRef(day)

  useEffect(() => {
    dayRef.current = day
  }, [day])

  const octokit = useMemo(
    () => (ready ? createOctokit(settings.token) : null),
    [ready, settings.token],
  )
  const repo: RepoRef | null = useMemo(
    () =>
      ready
        ? { owner: settings.owner, repo: settings.repo, branch: settings.branch }
        : null,
    [ready, settings.owner, settings.repo, settings.branch],
  )

  const pump = useCallback(async () => {
    if (!octokit || !repo) return
    if (inFlightRef.current) return
    const next = pendingRef.current
    if (!next) return
    pendingRef.current = null

    if (isDayEmpty(next) && !shaRef.current) {
      setStatus('idle')
      return
    }

    inFlightRef.current = true
    setStatus('saving')
    setSaveError(null)
    try {
      const canonical: DayFile = { ...next, date }
      const text = serializeDayMarkdown(canonical)
      const sha = await putFile(
        octokit,
        repo,
        dayFilePath(date),
        text,
        shaRef.current,
        `chore(day): ${date}`,
      )
      shaRef.current = sha
      patch(date, statsFromDay(canonical))
      if (!pendingRef.current) setStatus('saved')
    } catch (error) {
      const mapped = isAppError(error) ? error : mapGithubError(error)
      setSaveError(mapped)
      setStatus('error')
    } finally {
      inFlightRef.current = false
      if (pendingRef.current) void pump()
    }
  }, [octokit, repo, date, patch])

  const schedule = useCallback(
    (next: DayFile) => {
      const canonical = { ...next, date }
      dayRef.current = canonical
      setDay(canonical)
      pendingRef.current = canonical
      void pump()
    },
    [date, pump],
  )

  const reload = useCallback(async () => {
    if (!octokit || !repo) {
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError(null)
    try {
      const blob = await getFile(octokit, repo, dayFilePath(date))
      if (!blob) {
        shaRef.current = null
        const empty = emptyDayFile(date)
        dayRef.current = empty
        setDay(empty)
      } else {
        shaRef.current = blob.sha
        const parsed = { ...parseDayMarkdown(blob.text, date), date }
        dayRef.current = parsed
        setDay(parsed)
      }
    } catch (error) {
      setLoadError(isAppError(error) ? error : mapGithubError(error))
    } finally {
      setLoading(false)
    }
  }, [octokit, repo, date])

  useEffect(() => {
    pendingRef.current = null
    shaRef.current = null
    setStatus('idle')
    setSaveError(null)
    const empty = emptyDayFile(date)
    dayRef.current = empty
    setDay(empty)
    void reload()
  }, [date, reload])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (inFlightRef.current || pendingRef.current) return
      void reload()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [reload])

  const toggleTask = useCallback(
    (index: number) => {
      const current = dayRef.current
      schedule({
        ...current,
        tasks: current.tasks.map((task, i) => (i === index ? { ...task, done: !task.done } : task)),
      })
    },
    [schedule],
  )

  const setGoal = useCallback(
    (goal: string) => schedule({ ...dayRef.current, goal }),
    [schedule],
  )

  const setPlan = useCallback(
    (plan: string) => schedule({ ...dayRef.current, plan }),
    [schedule],
  )

  const addTasks = useCallback(
    (tasks: DayTask[]) => schedule({ ...dayRef.current, tasks: [...dayRef.current.tasks, ...tasks] }),
    [schedule],
  )

  const deleteTask = useCallback(
    (index: number) => {
      schedule({
        ...dayRef.current,
        tasks: dayRef.current.tasks.filter((_, i) => i !== index),
      })
    },
    [schedule],
  )

  const retrySave = useCallback(() => {
    pendingRef.current = dayRef.current
    void pump()
  }, [pump])

  return {
    day,
    loading,
    loadError,
    saveError,
    status,
    ready,
    toggleTask,
    setGoal,
    setPlan,
    addTasks,
    deleteTask,
    reload,
    retrySave,
  }
}
