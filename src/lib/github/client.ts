import { Octokit } from '@octokit/rest'
import { base64ToUtf8, utf8ToBase64 } from './base64.ts'
import { mapGithubError, type AppError } from './errors.ts'

export type RepoRef = {
  owner: string
  repo: string
  branch: string
}

export type FileBlob = {
  text: string
  sha: string
}

export const INDEX_PATH = 'data/graph_index.json'

export function dayFilePath(date: string): string {
  return `data/days/${date}.md`
}

export function createOctokit(token: string): Octokit {
  return new Octokit({ auth: token })
}

export async function testRepoAccess(octokit: Octokit, ref: RepoRef): Promise<void> {
  await octokit.repos.get({ owner: ref.owner, repo: ref.repo })
}

export async function getFile(octokit: Octokit, ref: RepoRef, path: string): Promise<FileBlob | null> {
  try {
    const { data } = await octokit.repos.getContent({
      owner: ref.owner,
      repo: ref.repo,
      path,
      ref: ref.branch,
    })
    if (Array.isArray(data) || data.type !== 'file' || !('content' in data) || !data.sha) {
      throw { status: 404, message: 'not a file' }
    }
    if ('truncated' in data && data.truncated) {
      const err: AppError = {
        code: 'truncated',
        message: 'Файл слишком большой, GitHub отдал его обрезанным. Не сохраняйте поверх.',
      }
      throw err
    }
    const encoding = 'encoding' in data ? data.encoding : 'base64'
    const content = 'content' in data && typeof data.content === 'string' ? data.content : ''
    const text = encoding === 'base64' ? base64ToUtf8(content) : content
    return { text, sha: data.sha }
  } catch (error) {
    const mapped = mapGithubError(error)
    if (mapped.code === 'not_found') return null
    if ((error as { status?: number }).status === 404) return null
    throw mapped
  }
}

export async function putFile(
  octokit: Octokit,
  ref: RepoRef,
  path: string,
  text: string,
  sha: string | null,
  message: string,
): Promise<string> {
  try {
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: ref.owner,
      repo: ref.repo,
      path,
      message,
      content: utf8ToBase64(text),
      branch: ref.branch,
      ...(sha ? { sha } : {}),
    })
    const newSha = data.content?.sha
    if (!newSha) throw { status: 500, message: 'GitHub не вернул sha' }
    return newSha
  } catch (error) {
    throw mapGithubError(error)
  }
}

export async function getIndexFile(octokit: Octokit, ref: RepoRef): Promise<FileBlob | null> {
  return getFile(octokit, ref, INDEX_PATH)
}
