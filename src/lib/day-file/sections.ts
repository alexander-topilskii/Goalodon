export type MarkdownSection = {
  title: string
  body: string
}

export function splitMarkdownSections(content: string): MarkdownSection[] {
  const text = content.replace(/\r\n/g, '\n')
  const headingRe = /^##[ \t]+(.+?)[ \t]*$/gm
  const matches = [...text.matchAll(headingRe)]
  if (matches.length === 0) {
    const trimmed = text.trim()
    return trimmed ? [{ title: '', body: text.replace(/\n+$/, '').replace(/^\n+/, '') }] : []
  }

  const sections: MarkdownSection[] = []
  const firstIndex = matches[0]?.index ?? 0
  const preamble = text.slice(0, firstIndex).trim()
  if (preamble) {
    sections.push({ title: '', body: preamble })
  }

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i]
    if (!match) continue
    const title = (match[1] ?? '').trim()
    const start = (match.index ?? 0) + match[0].length
    const next = matches[i + 1]
    const end = next?.index ?? text.length
    const body = text
      .slice(start, end)
      .replace(/^\n/, '')
      .replace(/\n+$/, '')
    sections.push({ title, body })
  }

  return sections
}
