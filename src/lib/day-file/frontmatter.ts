import { FAILSAFE_SCHEMA, load } from 'js-yaml'

function yamlScalar(value: string): string {
  return JSON.stringify(value)
}

function yamlValue(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'string') return yamlScalar(value)
  return JSON.stringify(value)
}

export function stringifyFrontmatter(fields: Record<string, unknown>): string {
  const lines = ['---']
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue
    lines.push(`${key}: ${yamlValue(value)}`)
  }
  lines.push('---')
  return lines.join('\n')
}

export function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
  if (!text.startsWith('---')) {
    return { data: {}, content: text }
  }

  const afterOpen = text.startsWith('---\n') ? text.slice(4) : text.slice(3)
  const close = afterOpen.match(/\n---[ \t]*(?:\n|$)/)
  if (!close || close.index == null) {
    return { data: {}, content: text }
  }

  const yaml = afterOpen.slice(0, close.index)
  const rest = afterOpen.slice(close.index + close[0].length)
  const loaded = load(yaml, { schema: FAILSAFE_SCHEMA })
  const data =
    loaded && typeof loaded === 'object' && !Array.isArray(loaded)
      ? (loaded as Record<string, unknown>)
      : {}
  return { data, content: rest }
}
