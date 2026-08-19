import { describe, expect, it } from 'vitest'
import { looksLikeGithubToken, parseGithubPagesLocation, parseGitRemoteUrl } from './repo.ts'

describe('parseGitRemoteUrl', () => {
  it('parses https and ssh remotes', () => {
    expect(parseGitRemoteUrl('https://github.com/alexander-topilskii/Goalodon.git')).toEqual({
      owner: 'alexander-topilskii',
      repo: 'Goalodon',
    })
    expect(parseGitRemoteUrl('git@github.com:alexander-topilskii/Goalodon.git')).toEqual({
      owner: 'alexander-topilskii',
      repo: 'Goalodon',
    })
  })
})

describe('parseGithubPagesLocation', () => {
  it('uses BASE_URL as the repo name', () => {
    expect(
      parseGithubPagesLocation('alexander-topilskii.github.io', '/Goalodon/', '/Goalodon/'),
    ).toEqual({ owner: 'alexander-topilskii', repo: 'Goalodon' })
  })
})

describe('looksLikeGithubToken', () => {
  it('accepts classic and fine-grained prefixes', () => {
    expect(looksLikeGithubToken('ghp_' + 'a'.repeat(36))).toBe(true)
    expect(looksLikeGithubToken('github_pat_' + 'a'.repeat(40))).toBe(true)
    expect(looksLikeGithubToken('not-a-token')).toBe(false)
  })
})
