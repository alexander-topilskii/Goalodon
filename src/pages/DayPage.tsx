import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorBanner, NeedSetup, SaveStatus } from '../components/Feedback.tsx'
import { DaySkeleton } from '../components/Skeleton.tsx'
import { dayHeading, isValidISODate } from '../lib/dates.ts'
import { parseAddedTasks, type DayGoal } from '../lib/day-file/index.ts'
import { isRestKind } from '../lib/programs/program.ts'
import { useDayFile } from '../lib/use-day-file.ts'

export function DayPage() {
  const { date = '' } = useParams()
  if (!isValidISODate(date)) {
    return (
      <section className="flex flex-col gap-3">
        <h1 className="text-lg font-semibold">Некорректная дата</h1>
        <p className="text-sm text-stone-600">В адресе должна быть дата вида YYYY-MM-DD.</p>
        <Link to="/" className="text-sm font-medium underline">
          К календарю
        </Link>
      </section>
    )
  }

  return <DayBody date={date} />
}

function DayBody({ date }: { date: string }) {
  const {
    day,
    loading,
    loadError,
    saveError,
    status,
    ready,
    setGoalTitle,
    setGoalPlan,
    setGoalProject,
    toggleTask,
    addTasks,
    deleteTask,
    addGoal,
    deleteGoal,
    reload,
    retrySave,
  } = useDayFile(date)
  const [adding, setAdding] = useState<number | null>(null)
  const [taskMenu, setTaskMenu] = useState<{ goal: number; task: number } | null>(null)
  const [goalMenu, setGoalMenu] = useState<number | null>(null)
  const [editNewTitle, setEditNewTitle] = useState(false)

  if (!ready) return <NeedSetup />

  return (
    <section className="flex flex-col gap-4" aria-busy={loading}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold capitalize leading-tight">{dayHeading(date)}</h1>
        </div>
        {loading ? null : <SaveStatus status={status} />}
      </div>

      {loadError ? (
        <ErrorBanner message={loadError.message} actionLabel="Обновить" onAction={() => void reload()} />
      ) : null}
      {saveError ? (
        <ErrorBanner
          message={saveError.message}
          actionLabel={saveError.code === 'conflict' ? 'Обновить' : 'Повторить'}
          onAction={saveError.code === 'conflict' ? () => void reload() : retrySave}
        />
      ) : null}

      {loading ? (
        <DaySkeleton />
      ) : (
        <>
          {day.goals.length === 0 ? (
            <p className="text-sm text-stone-500">Пока нет целей. Добавьте первую.</p>
          ) : null}
          {day.goals.map((goal, goalIndex) => (
            <GoalCard
              key={goalIndex}
              goal={goal}
              autoEditTitle={editNewTitle && goalIndex === day.goals.length - 1}
              menuOpen={goalMenu === goalIndex}
              openTask={taskMenu?.goal === goalIndex ? taskMenu.task : null}
              onToggleMenu={() => setGoalMenu(goalMenu === goalIndex ? null : goalIndex)}
              onDeleteGoal={() => {
                if (
                  (goal.title.trim() || goal.plan.trim() || goal.tasks.length > 0) &&
                  !window.confirm('Удалить цель и её задачи?')
                ) {
                  return
                }
                deleteGoal(goalIndex)
                setGoalMenu(null)
              }}
              onTitle={(title) => {
                setGoalTitle(goalIndex, title)
                setEditNewTitle(false)
              }}
              onPlan={(plan) => setGoalPlan(goalIndex, plan)}
              onProject={(project) => setGoalProject(goalIndex, project)}
              onToggleTask={(taskIndex) => toggleTask(goalIndex, taskIndex)}
              onTaskMenu={(taskIndex) => {
                setTaskMenu(
                  taskMenu?.goal === goalIndex && taskMenu.task === taskIndex
                    ? null
                    : { goal: goalIndex, task: taskIndex },
                )
              }}
              onDeleteTask={(taskIndex) => {
                deleteTask(goalIndex, taskIndex)
                setTaskMenu(null)
              }}
              onAddTasks={() => setAdding(goalIndex)}
            />
          ))}
          <button
            type="button"
            className="min-h-12 rounded-2xl border border-stone-300 bg-white text-sm font-medium"
            onClick={() => {
              addGoal()
              setEditNewTitle(true)
              setGoalMenu(null)
            }}
          >
            Добавить цель
          </button>
        </>
      )}

      {adding != null ? (
        <AddSheet
          onCancel={() => setAdding(null)}
          onSave={(raw) => {
            const tasks = parseAddedTasks(raw)
            if (tasks.length) addTasks(adding, tasks)
            setAdding(null)
          }}
        />
      ) : null}
    </section>
  )
}

function GoalCard({
  goal,
  autoEditTitle,
  menuOpen,
  openTask,
  onToggleMenu,
  onDeleteGoal,
  onTitle,
  onPlan,
  onProject,
  onToggleTask,
  onTaskMenu,
  onDeleteTask,
  onAddTasks,
}: {
  goal: DayGoal
  autoEditTitle: boolean
  menuOpen: boolean
  openTask: number | null
  onToggleMenu: () => void
  onDeleteGoal: () => void
  onTitle: (title: string) => void
  onPlan: (plan: string) => void
  onProject: (project: string) => void
  onToggleTask: (index: number) => void
  onTaskMenu: (index: number) => void
  onDeleteTask: (index: number) => void
  onAddTasks: () => void
}) {
  return (
    <article className="flex flex-col gap-3 rounded-3xl bg-white p-3 shadow-sm">
      <div className="flex items-start gap-1">
        <div className="min-w-0 flex-1">
          <EditableBlock
            label="Цель"
            value={goal.title}
            placeholder="Название цели"
            autoEdit={autoEditTitle}
            onSave={onTitle}
          />
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center text-stone-400"
          aria-label="Действия с целью"
          onClick={onToggleMenu}
        >
          ⋯
        </button>
      </div>
      {menuOpen ? (
        <div className="flex justify-end">
          <button type="button" className="min-h-11 rounded-xl px-3 text-sm text-red-700" onClick={onDeleteGoal}>
            Удалить цель
          </button>
        </div>
      ) : null}

      <EditableBlock
        label="Проект"
        value={goal.project}
        placeholder="Пусто — точечная задача"
        onSave={onProject}
      />

      <EditableBlock
        label="План"
        value={goal.plan}
        placeholder="Свободный план"
        multiline
        onSave={onPlan}
      />

      <div>
        <h2 className="mb-2 text-sm font-semibold text-stone-500">Задачи</h2>
        {goal.tasks.length === 0 ? (
          <p className="text-sm text-stone-500">
            {isRestKind(goal.title) ? 'Сегодня без подходов.' : 'Пока пусто. Добавьте задачи кнопкой ниже.'}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {goal.tasks.map((task, index) => (
                <TaskRow
                  key={`${index}-${task.text}`}
                  task={task}
                  menuOpen={openTask === index}
                  onToggle={() => onToggleTask(index)}
                  onMenu={() => onTaskMenu(index)}
                  onDelete={() => onDeleteTask(index)}
                />
              ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        className="min-h-12 rounded-2xl bg-stone-900 text-sm font-medium text-white"
        onClick={onAddTasks}
      >
        Добавить задачи
      </button>
    </article>
  )
}

function TaskRow({
  task,
  menuOpen,
  onToggle,
  onMenu,
  onDelete,
}: {
  task: { text: string; done: boolean; notes: string[] }
  menuOpen: boolean
  onToggle: () => void
  onMenu: () => void
  onDelete: () => void
}) {
  return (
    <li className="rounded-2xl bg-[#fbf8f3] px-2 py-1">
      <div className="flex items-start gap-1">
        <button
          type="button"
          role="checkbox"
          aria-checked={task.done}
          aria-label={task.text}
          onClick={onToggle}
          className={[
            'mt-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl',
            task.done ? 'text-emerald-700' : 'text-stone-300',
          ].join(' ')}
        >
          <span
            className={[
              'flex h-6 w-6 items-center justify-center rounded-md border-2 text-sm',
              task.done ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-stone-300',
            ].join(' ')}
          >
            {task.done ? '✓' : ''}
          </span>
        </button>
        <div className="min-w-0 flex-1 py-2.5 pr-1">
          <p className={task.done ? 'text-stone-500 line-through' : 'text-stone-900'}>{task.text}</p>
          {task.notes.map((note) => (
            <p key={note} className="mt-1 text-sm text-stone-400">
              {note}
            </p>
          ))}
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center text-stone-400"
          aria-label="Действия"
          onClick={onMenu}
        >
          ⋯
        </button>
      </div>
      {menuOpen ? (
        <div className="flex justify-end pb-2 pr-2">
          <button type="button" className="min-h-11 rounded-xl px-3 text-sm text-red-700" onClick={onDelete}>
            Удалить
          </button>
        </div>
      ) : null}
    </li>
  )
}

function EditableBlock({
  label,
  value,
  placeholder,
  multiline = false,
  autoEdit = false,
  onSave,
}: {
  label: string
  value: string
  placeholder: string
  multiline?: boolean
  autoEdit?: boolean
  onSave: (value: string) => void
}) {
  const [editing, setEditing] = useState(autoEdit)
  const [draft, setDraft] = useState(value)

  if (!editing) {
    return (
      <button
        type="button"
        className="w-full rounded-2xl bg-[#fbf8f3] p-3 text-left"
        onClick={() => {
          setDraft(value)
          setEditing(true)
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{label}</p>
        <p className={`mt-1 whitespace-pre-wrap ${value ? 'text-stone-800' : 'text-stone-400'}`}>
          {value || placeholder}
        </p>
      </button>
    )
  }

  return (
    <div className="rounded-2xl bg-[#fbf8f3] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{label}</p>
      {multiline ? (
        <textarea
          className="mt-2 min-h-24 w-full resize-y rounded-xl border border-stone-200 bg-white p-2 text-base"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          autoFocus
        />
      ) : (
        <input
          className="mt-2 w-full rounded-xl border border-stone-200 bg-white p-2 text-base"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          autoFocus
        />
      )}
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" className="min-h-11 px-3 text-sm" onClick={() => setEditing(false)}>
          Отмена
        </button>
        <button
          type="button"
          className="min-h-11 rounded-xl bg-stone-900 px-3 text-sm text-white"
          onClick={() => {
            onSave(draft)
            setEditing(false)
          }}
        >
          Готово
        </button>
      </div>
    </div>
  )
}

function AddSheet({
  onCancel,
  onSave,
}: {
  onCancel: () => void
  onSave: (raw: string) => void
}) {
  const [raw, setRaw] = useState('')

  const close = () => {
    if (raw.trim() && !window.confirm('Сбросить черновик?')) return
    onCancel()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-stone-900/40 p-0 sm:items-center">
      <div
        className="w-full max-w-lg rounded-t-3xl bg-[#fbf8f3] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-3xl"
        role="dialog"
        aria-label="Добавить задачи"
      >
        <h2 className="text-lg font-semibold">Добавить задачи</h2>
        <p className="mt-1 text-sm text-stone-500">
          Одна задача на строку. Можно писать <code>- [ ] текст</code> и <code>&gt; напоминание</code>
          — или просто текст.
        </p>
        <textarea
          className="mt-3 min-h-40 w-full resize-y rounded-2xl border border-stone-200 bg-white p-3 text-base"
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder={'- [ ] 3 подход: 8 подтягиваний\n  > Отдых 2 минуты'}
          autoFocus
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className="min-h-12 flex-1 rounded-2xl border border-stone-300 bg-white text-sm font-medium"
            onClick={close}
          >
            Отмена
          </button>
          <button
            type="button"
            className="min-h-12 flex-1 rounded-2xl bg-stone-900 text-sm font-medium text-white"
            onClick={() => onSave(raw)}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}
