import { useState } from 'react'
import { ErrorBanner } from '../components/Feedback.tsx'
import { createOctokit, testRepoAccess } from '../lib/github/client.ts'
import { isAppError, mapGithubError } from '../lib/github/errors.ts'
import { isValidOwnerRepo, maskToken } from '../lib/settings.ts'
import { useSettings } from '../lib/settings-context.tsx'

export function SettingsPage() {
  const { settings, update, logout } = useSettings()
  const [token, setToken] = useState('')
  const [owner, setOwner] = useState(settings.owner)
  const [repo, setRepo] = useState(settings.repo)
  const [branch, setBranch] = useState(settings.branch || 'main')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const save = async (check: boolean) => {
    setError(null)
    setStatus(null)
    const nextToken = token.trim() || settings.token
    if (!nextToken) {
      setError('Вставьте fine-grained PAT с Contents: Read and write.')
      return
    }
    if (!isValidOwnerRepo(owner.trim(), repo.trim())) {
      setError('Укажите owner и repo в виде латиницы, например aleks/Goalodon.')
      return
    }
    const next = {
      token: nextToken,
      owner: owner.trim(),
      repo: repo.trim(),
      branch: branch.trim() || 'main',
    }
    update(next)
    if (!check) {
      setStatus('Сохранено локально.')
      setToken('')
      return
    }
    setBusy(true)
    try {
      await testRepoAccess(createOctokit(next.token), next)
      setStatus('Доступ есть. Можно открывать календарь.')
      setToken('')
    } catch (err) {
      setError((isAppError(err) ? err : mapGithubError(err)).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Настройки</h1>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">
          Один пользователь, без своего сервера. UI ходит в GitHub API из браузера. Клон на диске —
          это код приложения, база — файлы в репозитории на GitHub.
        </p>
      </div>

      <ol className="list-decimal space-y-2 rounded-2xl bg-white p-4 pl-8 text-sm leading-relaxed text-stone-700">
        <li>Сделайте приватный fork или копию этого репозитория на GitHub.</li>
        <li>
          Включите Actions и права <strong>Read and write</strong> для Workflow permissions — иначе
          индекс календаря не обновится.
        </li>
        <li>
          Создайте fine-grained PAT только на этот репозиторий: Contents Read and write. Classic{' '}
          <code>repo</code> тоже сработает, но шире, чем нужно.
        </li>
        <li>Вставьте токен и owner/repo ниже, нажмите «Проверить доступ».</li>
      </ol>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Токен
        <input
          type="password"
          autoComplete="off"
          className="min-h-12 rounded-xl border border-stone-200 bg-white px-3 font-normal"
          placeholder={settings.token ? maskToken(settings.token) : 'github_pat_…'}
          value={token}
          onChange={(event) => setToken(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Owner
        <input
          className="min-h-12 rounded-xl border border-stone-200 bg-white px-3 font-normal"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Репозиторий
        <input
          className="min-h-12 rounded-xl border border-stone-200 bg-white px-3 font-normal"
          value={repo}
          onChange={(event) => setRepo(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Ветка
        <input
          className="min-h-12 rounded-xl border border-stone-200 bg-white px-3 font-normal"
          value={branch}
          onChange={(event) => setBranch(event.target.value)}
        />
      </label>

      {error ? <ErrorBanner message={error} /> : null}
      {status ? <p className="text-sm text-emerald-800">{status}</p> : null}

      <button
        type="button"
        disabled={busy}
        className="min-h-12 rounded-2xl bg-stone-900 text-sm font-medium text-white disabled:opacity-60"
        onClick={() => void save(true)}
      >
        Проверить доступ
      </button>
      <button
        type="button"
        className="min-h-12 rounded-2xl border border-stone-300 bg-white text-sm font-medium"
        onClick={() => void save(false)}
      >
        Сохранить без проверки
      </button>
      {settings.token ? (
        <button
          type="button"
          className="min-h-12 text-sm text-stone-500"
          onClick={() => {
            logout()
            setToken('')
            setStatus('Токен удалён с этого устройства.')
          }}
        >
          Выйти (стереть токен)
        </button>
      ) : null}
    </section>
  )
}
