import { describe, expect, it } from 'vitest'
import { isAppError, mapGithubError } from './errors.ts'

describe('mapGithubError', () => {
  it('maps browser CORS/fetch failures instead of showing Failed to fetch', () => {
    expect(mapGithubError(new TypeError('Failed to fetch'))).toEqual({
      code: 'network',
      message: 'Нет сети. Проверьте соединение и повторите.',
    })
    expect(mapGithubError({ status: 500, message: 'Failed to fetch' })).toEqual({
      code: 'network',
      message: 'Нет сети. Проверьте соединение и повторите.',
    })
  })

  it('does not treat Octokit HttpError as an already-mapped AppError', () => {
    const octokit = { name: 'HttpError', status: 401, message: 'Bad credentials', code: 'HTTP_ERROR' }
    expect(isAppError(octokit)).toBe(false)
    expect(mapGithubError(octokit).code).toBe('unauthorized')
  })
})
