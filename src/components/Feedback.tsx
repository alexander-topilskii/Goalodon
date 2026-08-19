import { Link } from 'react-router-dom'
import { GitHubConnect } from './GitHubConnect.tsx'
import { detectRepo } from '../lib/github/repo.ts'
import { useSettings } from '../lib/settings-context.tsx'

export function NeedSetup() {
  const { settings } = useSettings()
  const detected = detectRepo()
  const known = Boolean(
    (settings.owner || detected.owner) && (settings.repo || detected.repo),
  )
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 text-stone-700">
      <h2 className="text-base font-semibold text-stone-900">Подключите GitHub</h2>
      {known ? (
        <div className="mt-4">
          <GitHubConnect compact />
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed">
            Не удалось определить репозиторий автоматически. Укажите его в настройках.
          </p>
          <Link
            to="/settings"
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-stone-900 px-4 text-sm font-medium text-white"
          >
            Открыть настройки
          </Link>
        </>
      )}
    </section>
  )
}

export function ErrorBanner({
  message,
  actionLabel,
  onAction,
}: {
  message: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-900">
      <p>{message}</p>
      {actionLabel && onAction ? (
        <button type="button" className="mt-2 font-medium underline" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

export function SaveStatus({
  status,
}: {
  status: 'idle' | 'saving' | 'saved' | 'error'
}) {
  if (status === 'idle') return null
  const label =
    status === 'saving' ? 'Сохраняем…' : status === 'saved' ? 'Сохранено' : 'Ошибка сохранения'
  return <p className="text-xs text-stone-500">{label}</p>
}
