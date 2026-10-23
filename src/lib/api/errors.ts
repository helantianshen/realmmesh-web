import type { ApiReason } from './types'

/** 统一 API 错误：结构与中心服务 Kratos 错误编码（code/reason/message/metadata）对齐 */
export class ApiError extends Error {
  readonly status: number
  readonly reason: ApiReason | string
  readonly metadata: Record<string, string>

  constructor(init: {
    status: number
    reason: ApiReason | string
    message: string
    metadata?: Record<string, string>
  }) {
    super(init.message)
    this.name = 'ApiError'
    this.status = init.status
    this.reason = init.reason
    this.metadata = init.metadata ?? {}
  }

  /** 密码错误剩余次数（登录失败时后端通过 metadata 返回） */
  get remainingAttempts(): number | undefined {
    const v = this.metadata['remaining_attempts']
    return v !== undefined ? Number(v) : undefined
  }

  /** 休息期剩余秒数 */
  get retryAfterSeconds(): number | undefined {
    const v = this.metadata['retry_after_seconds']
    return v !== undefined ? Number(v) : undefined
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}
