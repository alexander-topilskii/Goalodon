export type AppErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limit'
  | 'network'
  | 'truncated'
  | 'parse'
  | 'unknown'

export type AppError = {
  code: AppErrorCode
  message: string
}

const APP_CODES: ReadonlySet<string> = new Set([
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'rate_limit',
  'network',
  'truncated',
  'parse',
  'unknown',
])

export function isAppError(value: unknown): value is AppError {
  if (!value || typeof value !== 'object') return false
  const code = (value as { code?: unknown }).code
  const message = (value as { message?: unknown }).message
  return typeof code === 'string' && APP_CODES.has(code) && typeof message === 'string'
}

type OctokitLikeError = {
  status?: number
  message?: string
  name?: string
}

export function isNetworkFailure(error: unknown): boolean {
  if (error instanceof TypeError) return true
  const message = String((error as { message?: unknown }).message ?? '').toLowerCase()
  return (
    message.includes('failed to fetch') ||
    message.includes('load failed') ||
    message.includes('networkerror') ||
    message.includes('network request failed')
  )
}

export function mapGithubError(error: unknown): AppError {
  if (isAppError(error)) return error
  if (isNetworkFailure(error)) {
    return { code: 'network', message: 'Нет сети. Проверьте соединение и повторите.' }
  }

  const err = error as OctokitLikeError
  const status = err.status
  if (status === 401) {
    return { code: 'unauthorized', message: 'Токен истёк или неверный. Вставьте новый в Настройках.' }
  }
  if (status === 403) {
    const text = (err.message ?? '').toLowerCase()
    if (text.includes('rate limit') || text.includes('secondary rate')) {
      return { code: 'rate_limit', message: 'GitHub ограничил частоту запросов. Подождите минуту.' }
    }
    return {
      code: 'forbidden',
      message: 'Нет прав Contents Write на этот репозиторий, или сработал лимит GitHub.',
    }
  }
  if (status === 404) {
    return { code: 'not_found', message: 'Репозиторий не найден или PAT не имеет к нему доступа.' }
  }
  if (status === 409 || status === 422) {
    return { code: 'conflict', message: 'День изменился в другом месте. Обновите и повторите.' }
  }

  return { code: 'unknown', message: err.message || 'Неизвестная ошибка GitHub.' }
}
