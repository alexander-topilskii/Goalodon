import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseDayMarkdown, statsFromDay } from '../src/lib/day-file/index.ts'
import type { DayIndexEntry } from '../src/lib/day-file/types.ts'

const daysDir = path.resolve('data/days')
const outFile = path.resolve('data/graph_index.json')

await mkdir(daysDir, { recursive: true })
const names = await readdir(daysDir)
const days: Record<string, DayIndexEntry> = {}

for (const name of names) {
  if (!name.endsWith('.md')) continue
  const match = /^(\d{4}-\d{2}-\d{2})\.md$/.exec(name)
  if (!match) {
    console.warn(`skip ${name}: имя не YYYY-MM-DD.md`)
    continue
  }
  const date = match[1] ?? name
  const raw = await readFile(path.join(daysDir, name), 'utf8')
  try {
    const day = parseDayMarkdown(raw, date)
    days[date] = statsFromDay({ ...day, date })
  } catch (error) {
    console.warn(`skip ${name}:`, error)
  }
}

const json = {
  generatedAt: new Date().toISOString(),
  days,
}

await writeFile(outFile, `${JSON.stringify(json, null, 2)}\n`, 'utf8')
console.log(`wrote ${outFile} (${Object.keys(days).length} days)`)
