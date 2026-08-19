import { useState } from 'react'
import { GitHubConnect } from '../components/GitHubConnect.tsx'
import { maskToken } from '../lib/settings.ts'
import { useSettings } from '../lib/settings-context.tsx'

export function SettingsPage() {
  const { settings, ready, logout } = useSettings()
  const [advanced, setAdvanced] = useState(!settings.owner || !settings.repo)

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">Настройки</h1>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">
          Репозиторий определяется сам. Нужен только одноразовый доступ GitHub — без своего сервера
          OAuth в браузере недоступен.
        </p>
      </div>

      {ready ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-stone-700">
          <p>
            Подключено: <span className="font-medium text-stone-900">{settings.owner}/{settings.repo}</span>
          </p>
          <p className="mt-1 text-stone-400">Токен {maskToken(settings.token)}</p>
          <button
            type="button"
            className="mt-3 min-h-11 text-sm text-stone-500"
            onClick={() => logout()}
          >
            Выйти
          </button>
        </div>
      ) : (
        <GitHubConnect />
      )}

      <button
        type="button"
        className="text-left text-sm text-stone-400"
        onClick={() => setAdvanced((value) => !value)}
      >
        {advanced ? 'Скрыть ручные поля' : 'Репозиторий определяется неверно'}
      </button>
      {advanced ? <ManualRepoFields /> : null}
    </section>
  )
}

function ManualRepoFields() {
  const { settings, update } = useSettings()
  const [owner, setOwner] = useState(settings.owner)
  const [repo, setRepo] = useState(settings.repo)
  const [branch, setBranch] = useState(settings.branch || 'main')

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 p-4">
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
      <button
        type="button"
        className="min-h-12 rounded-2xl border border-stone-300 bg-white text-sm font-medium"
        onClick={() =>
          update({
            token: settings.token,
            owner: owner.trim(),
            repo: repo.trim(),
            branch: branch.trim() || 'main',
          })
        }
      >
        Сохранить репозиторий
      </button>
    </div>
  )
}
