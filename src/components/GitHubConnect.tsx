import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOctokit, testRepoAccess } from '../lib/github/client.ts'
import { isAppError, mapGithubError } from '../lib/github/errors.ts'
import { detectRepo, looksLikeGithubToken, tokenCreateUrl } from '../lib/github/repo.ts'
import { useSettings } from '../lib/settings-context.tsx'
import { ErrorBanner } from './Feedback.tsx'

export function GitHubConnect({ compact = false }: { compact?: boolean }) {
  const { settings, update } = useSettings()
  const navigate = useNavigate()
  const detected = detectRepo()
  const owner = settings.owner || detected.owner
  const repo = settings.repo || detected.repo
  const branch = settings.branch || detected.branch || 'main'
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [waiting, setWaiting] = useState(false)

  const connect = async (raw: string) => {
    const nextToken = raw.trim()
    if (!looksLikeGithubToken(nextToken) && nextToken.length < 20) {
      setError('Это не похоже на GitHub-токен. Скопируйте его на странице создания и вставьте сюда.')
      return
    }
    if (!owner || !repo) {
      setError('Не удалось определить репозиторий. Откройте настройки и укажите owner/repo.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const next = { token: nextToken, owner, repo, branch }
      await testRepoAccess(createOctokit(next.token), next)
      update(next)
      setToken('')
      setWaiting(false)
      navigate('/')
    } catch (err) {
      setError((isAppError(err) ? err : mapGithubError(err)).message)
    } finally {
      setBusy(false)
    }
  }

  const connectRef = useRef(connect)
  connectRef.current = connect

  const openGithub = () => {
    window.open(tokenCreateUrl(owner, repo), '_blank', 'noopener,noreferrer')
    setWaiting(true)
    setError(null)
  }

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const text = event.clipboardData?.getData('text') ?? ''
      if (!looksLikeGithubToken(text)) return
      event.preventDefault()
      void connectRef.current(text)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [])

  const repoLabel = owner && repo ? `${owner}/${repo}` : 'репозиторий не определён'

  return (
    <div className="flex flex-col gap-4">
      {!compact ? (
        <p className="text-sm leading-relaxed text-stone-600">
          Репозиторий подставился сам. Осталось один раз выдать доступ: GitHub не умеет отдать токен
          статическому сайту без этой кнопки.
        </p>
      ) : null}

      <p className="rounded-2xl bg-stone-100 px-3 py-3 text-sm text-stone-700">
        Данные: <span className="font-medium text-stone-900">{repoLabel}</span>
        {branch ? <span className="text-stone-400"> · {branch}</span> : null}
      </p>

      <button
        type="button"
        className="min-h-12 rounded-2xl bg-stone-900 text-sm font-medium text-white"
        onClick={openGithub}
      >
        Выдать доступ на GitHub
      </button>

      {waiting ? (
        <p className="text-sm text-stone-600">
          Нажмите Generate token, скопируйте его и вернитесь сюда — вставьте ⌘V / Ctrl+V.
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Или вставьте токен
        <input
          type="password"
          autoComplete="off"
          className="min-h-12 rounded-xl border border-stone-200 bg-white px-3 font-normal"
          placeholder="ghp_… или github_pat_…"
          value={token}
          onChange={(event) => {
            const value = event.target.value
            setToken(value)
            if (looksLikeGithubToken(value)) void connect(value)
          }}
        />
      </label>

      <button
        type="button"
        disabled={busy || !token.trim()}
        className="min-h-12 rounded-2xl border border-stone-300 bg-white text-sm font-medium disabled:opacity-50"
        onClick={() => void connect(token)}
      >
        {busy ? 'Проверяем…' : 'Подключить'}
      </button>

      {error ? <ErrorBanner message={error} /> : null}
    </div>
  )
}
