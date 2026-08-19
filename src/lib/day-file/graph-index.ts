import type { DayIndexEntry, GoalIndexEntry, GraphIndex } from './types.ts'

export const emptyGraphIndex: GraphIndex = { generatedAt: null, days: {} }

export function parseGraphIndex(text: string): GraphIndex {
  const raw = JSON.parse(text) as Partial<GraphIndex>
  const days: Record<string, DayIndexEntry> = {}
  if (raw.days && typeof raw.days === 'object') {
    for (const [date, entry] of Object.entries(raw.days)) {
      days[date] = normalizeEntry(entry)
    }
  }
  return {
    generatedAt: typeof raw.generatedAt === 'string' ? raw.generatedAt : null,
    days,
  }
}

function normalizeEntry(raw: unknown): DayIndexEntry {
  const entry = raw && typeof raw === 'object' ? (raw as Partial<DayIndexEntry>) : {}
  return {
    goal: typeof entry.goal === 'string' ? entry.goal : '',
    total: Number(entry.total) || 0,
    done: Number(entry.done) || 0,
    hasContent: Boolean(entry.hasContent),
    goals: Array.isArray(entry.goals) ? entry.goals.map(normalizeGoal) : [],
  }
}

function normalizeGoal(raw: unknown): GoalIndexEntry {
  const goal = raw && typeof raw === 'object' ? (raw as Partial<GoalIndexEntry>) : {}
  return {
    title: typeof goal.title === 'string' ? goal.title : '',
    project: typeof goal.project === 'string' ? goal.project : '',
    total: Number(goal.total) || 0,
    done: Number(goal.done) || 0,
  }
}
