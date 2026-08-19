const REPO_NAME = /^[\w.-]+$/

export type DetectedRepo = {
  owner: string
  repo: string
  branch: string
}

export function parseGitRemoteUrl(url: string): { owner: string; repo: string } | null {
  const trimmed = url.trim().replace(/\.git$/, '')
  const ssh = /github\.com[:/]([^/]+)\/([^/]+)$/i.exec(trimmed)
  if (!ssh) return null
  const owner = ssh[1] ?? ''
  const repo = (ssh[2] ?? '').replace(/\.git$/, '')
  if (!REPO_NAME.test(owner) || !REPO_NAME.test(repo)) return null
  return { owner, repo }
}

export function parseGithubPagesLocation(
  hostname: string,
  pathname: string,
  baseUrl: string,
): { owner: string; repo: string } | null {
  const host = /^([\w-]+)\.github\.io$/i.exec(hostname)
  if (!host) return null
  const owner = host[1] ?? ''
  const fromBase = baseUrl.replace(/^\/+|\/+$/g, '')
  const fromPath = pathname.split('/').filter(Boolean)[0] ?? ''
  const repo = fromBase || fromPath
  if (!REPO_NAME.test(owner)) return null
  if (!repo || repo === `${owner}.github.io`) {
    return { owner, repo: `${owner}.github.io` }
  }
  if (!REPO_NAME.test(repo)) return null
  return { owner, repo }
}

export function looksLikeGithubToken(value: string): boolean {
  const token = value.trim()
  return /^(ghp_|github_pat_|gho_|ghu_|ghs_)\S{20,}$/.test(token)
}

export function tokenCreateUrl(owner: string, repo: string): string {
  const description = encodeURIComponent(repo ? `Goalodon ${owner}/${repo}` : 'Goalodon')
  return `https://github.com/settings/tokens/new?scopes=repo&description=${description}`
}

export function bakedRepo(): DetectedRepo {
  return {
    owner: import.meta.env.VITE_GITHUB_OWNER ?? '',
    repo: import.meta.env.VITE_GITHUB_REPO ?? '',
    branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
  }
}

export function detectRepo(): DetectedRepo {
  const baked = bakedRepo()
  if (baked.owner && baked.repo) return baked
  if (typeof window === 'undefined') return baked
  const fromPages = parseGithubPagesLocation(
    window.location.hostname,
    window.location.pathname,
    import.meta.env.BASE_URL,
  )
  return {
    owner: baked.owner || fromPages?.owner || '',
    repo: baked.repo || fromPages?.repo || '',
    branch: baked.branch || 'main',
  }
}
