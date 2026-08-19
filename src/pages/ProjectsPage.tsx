import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorBanner, NeedSetup } from '../components/Feedback.tsx'
import { ProjectsSkeleton } from '../components/Skeleton.tsx'
import { shortDayLabel } from '../lib/dates.ts'
import { calendarCellClass } from '../lib/programs/program.ts'
import { projectDayRows, spotItems, summarizeProjects } from '../lib/projects.ts'
import { useGraphIndex } from '../lib/use-graph-index.ts'

export function ProjectsPage() {
  const { name } = useParams()
  if (name) return <ProjectDetail encoded={name} />
  return <ProjectsList />
}

function ProjectsList() {
  const { ready, merged, loading, fetched, error, load } = useGraphIndex()
  const projects = useMemo(() => summarizeProjects(merged.days), [merged.days])
  const spots = useMemo(() => spotItems(merged.days), [merged.days])

  if (!ready) return <NeedSetup />

  return (
    <section className="flex flex-col gap-5" aria-busy={loading}>
      <div>
        <h1 className="text-xl font-semibold">Проекты</h1>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">
          Длинные серии вроде подтягиваний — проект. Разовая цель без проекта — точечная задача.
        </p>
      </div>

      {error ? <ErrorBanner message={error.message} actionLabel="Повторить" onAction={() => void load()} /> : null}
      {loading && !fetched ? <ProjectsSkeleton /> : null}

      {!loading || fetched ? (
        <>
          {projects.length === 0 ? (
            <p className="text-sm text-stone-500">
              Пока нет проектов. В цели укажите поле «Проект», например «Подтягивания».
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {projects.map((project) => (
                <li key={project.name}>
                  <Link
                    to={`/projects/${encodeURIComponent(project.name)}`}
                    className="block rounded-3xl bg-white p-4 shadow-sm"
                  >
                    <p className="text-base font-semibold text-stone-900">{project.name}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      {shortDayLabel(project.start)} — {shortDayLabel(project.end)} · {project.days} дн.
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      {project.total > 0
                        ? `${project.done} из ${project.total} задач`
                        : 'Без чеклиста'}
                    </p>
                    <Progress done={project.done} total={project.total} />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div>
            <h2 className="text-sm font-semibold text-stone-500">Точечные задачи</h2>
            {spots.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">Разовых целей пока нет.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {spots.map((item) => (
                  <li key={`${item.date}-${item.title}`}>
                    <Link
                      to={`/day/${item.date}`}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-stone-900">{item.title}</span>
                        <span className="text-sm text-stone-500">{shortDayLabel(item.date)}</span>
                      </span>
                      {item.total > 0 ? (
                        <span className="shrink-0 text-sm text-stone-500">
                          {item.done}/{item.total}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </section>
  )
}

function ProjectDetail({ encoded }: { encoded: string }) {
  const { ready, merged, loading, fetched, error, load } = useGraphIndex()
  let name = encoded
  try {
    name = decodeURIComponent(encoded)
  } catch {
    name = encoded
  }
  const summary = useMemo(
    () => summarizeProjects(merged.days).find((project) => project.name === name),
    [merged.days, name],
  )
  const rows = useMemo(() => projectDayRows(merged.days, name), [merged.days, name])

  if (!ready) return <NeedSetup />

  return (
    <section className="flex flex-col gap-4" aria-busy={loading}>
      <div>
        <Link to="/projects" className="text-sm font-medium text-stone-500">
          ← Проекты
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{name}</h1>
        {summary ? (
          <p className="mt-1 text-sm text-stone-500">
            {shortDayLabel(summary.start)} — {shortDayLabel(summary.end)} · {summary.days} дн.
            {summary.total > 0 ? ` · ${summary.done} из ${summary.total}` : ''}
          </p>
        ) : null}
        {summary ? <Progress done={summary.done} total={summary.total} /> : null}
      </div>

      {error ? <ErrorBanner message={error.message} actionLabel="Повторить" onAction={() => void load()} /> : null}
      {loading && !fetched ? <ProjectsSkeleton /> : null}

      {!loading || fetched ? (
        rows.length === 0 ? (
          <p className="text-sm text-stone-500">В этом проекте пока нет дней.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((row) => (
              <li key={row.date}>
                <Link
                  to={`/day/${row.date}`}
                  className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm"
                >
                  <span
                    className={[
                      'flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-xs font-medium',
                      calendarCellClass({
                        goal: row.title,
                        total: row.total,
                        done: row.done,
                        hasContent: true,
                        goals: [],
                      }),
                    ].join(' ')}
                  >
                    {Number(row.date.slice(8, 10))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-stone-900">{row.title}</span>
                    <span className="text-sm text-stone-500">{shortDayLabel(row.date)}</span>
                  </span>
                  {row.total > 0 ? (
                    <span className="shrink-0 text-sm text-stone-500">
                      {row.done}/{row.total}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </section>
  )
}

function Progress({ done, total }: { done: number; total: number }) {
  if (total <= 0) return null
  const pct = Math.min(100, Math.round((done / total) * 100))
  return (
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-200">
      <div className="h-full rounded-full bg-stone-900" style={{ width: `${pct}%` }} />
    </div>
  )
}
