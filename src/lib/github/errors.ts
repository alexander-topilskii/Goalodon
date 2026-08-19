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

export function isAppError(value: unknown): value is AppError {
  return Boolean(value && typeof value === 'object' && 'code' in value && 'message' in value)
}

type OctokitLikeError = {
  status?: number
  message?: string
  name?: string
}

export function mapGithubError(error: unknown): AppError {
  if (isAppError(error)) return error
  if (error instanceof TypeError) {
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
