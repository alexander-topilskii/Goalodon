import { Link } from 'react-router-dom'

export function NeedSetup() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 text-stone-700">
      <h2 className="text-base font-semibold text-stone-900">Сначала доступ к GitHub</h2>
      <p className="mt-2 text-sm leading-relaxed">
        Приложение не читает файлы с диска. Данные живут в вашем приватном репозитории. Вставьте
        PAT и укажите owner/repo в настройках.
      </p>
      <Link
        to="/settings"
        className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-stone-900 px-4 text-sm font-medium text-white"
      >
        Открыть настройки
      </Link>
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
