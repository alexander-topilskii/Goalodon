import { execSync } from 'node:child_process'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

function parseGitRemoteUrl(url: string): { owner: string; repo: string } | null {
  const match = url
    .trim()
    .replace(/\.git$/, '')
    .match(/github\.com[:/]([^/]+)\/([^/]+)$/i)
  if (!match) return null
  return { owner: match[1] ?? '', repo: match[2] ?? '' }
}

function applyRepoEnv() {
  const fromActions = process.env.GITHUB_REPOSITORY?.split('/')
  if (!process.env.VITE_GITHUB_OWNER && fromActions?.[0]) {
    process.env.VITE_GITHUB_OWNER = fromActions[0]
  }
  if (!process.env.VITE_GITHUB_REPO && fromActions?.[1]) {
    process.env.VITE_GITHUB_REPO = fromActions[1]
  }
  if (!process.env.VITE_GITHUB_OWNER || !process.env.VITE_GITHUB_REPO) {
    try {
      const remote = execSync('git remote get-url origin', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
      const parsed = parseGitRemoteUrl(remote)
      if (parsed) {
        process.env.VITE_GITHUB_OWNER ||= parsed.owner
        process.env.VITE_GITHUB_REPO ||= parsed.repo
      }
    } catch {
      /* local clone without origin */
    }
  }
  const branch = process.env.VITE_GITHUB_BRANCH || process.env.GITHUB_REF_NAME || ''
  process.env.VITE_GITHUB_BRANCH =
    !branch || branch === 'gh-pages' ? process.env.GITHUB_DEFAULT_BRANCH || 'main' : branch
}

applyRepoEnv()

function pagesBase(): string {
  const raw = process.env.VITE_BASE ?? '/'
  if (!raw || raw === '/') return '/'
  return raw.endsWith('/') ? raw : `${raw}/`
}

export default defineConfig({
  base: pagesBase(),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
