/** 领域类型：字段命名与 realmmesh-server 已实现的 HTTP 契约保持一致，
 *  尚未实现的后端接口按同一风格在此提案，接入真实后端时以服务端为准调整。 */

export type SnowflakeID = string

/** 账户信息：与 POST /api/v1/auth/me 响应一致 */
export interface Account {
  id: SnowflakeID
  player_name: string
  is_admin: boolean
}

/** 登录结果：与 POST /api/v1/auth/login 响应一致 */
export interface LoginResult {
  access_token: string
  token_type: 'Bearer'
  expires_at: string
  user_id: SnowflakeID
  player_name: string
}

/** 业务错误码：与中心服务 internal/handler/errors.go 的固定 reason 对齐 */
export type ApiReason =
  | 'INVALID_REQUEST'
  | 'UNAUTHORIZED'
  | 'ADMIN_REQUIRED'
  | 'INTERNAL_ERROR'
  | 'WRONG_PASSWORD'
  | 'UNREGISTERED'
  | 'COOLING_DOWN'
  | 'AUTHENTICATION_CONFLICT'
  | 'PLAYER_NAME_INVALID'
  | 'PASSWORD_INVALID'
  | 'PLAYER_NAME_TAKEN'
  | 'ACCOUNT_NOT_FOUND'
  | 'ADMIN_DELETION_FORBIDDEN'
  | 'SERVER_NAME_INVALID'
  | 'SERVER_NOT_FOUND'
  | 'PAGINATION_INVALID'

/** 分页请求：与中心 pkg/pagination 公共字段一致 */
export interface PageRequest {
  page: number
  page_size: number
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

/* ---------------- 玩家端资产（提案契约，后端待实现） ---------------- */

export type ItemCategory = 'mat' | 'tool' | 'build' | 'use' | 'redstone'

export interface WarehouseItem {
  id: SnowflakeID
  name: string
  category: ItemCategory
  rare: boolean
  count: number
  source_server: string
  updated_at: string
  note?: string
}

export interface WarehouseSummary {
  used_slots: number
  total_slots: number
}

export type ActivityType = 'in' | 'out' | 'bonus' | 'security'

export interface ActivityRecord {
  id: SnowflakeID
  type: ActivityType
  title: string
  detail?: string
  server_name?: string
  time: string
}

export type PlayerServerStatus = 'online' | 'maintenance'

export interface PlayerServer {
  id: SnowflakeID
  name: string
  title: string
  status: PlayerServerStatus
  ping_ms: number | null
}

export interface AssetsOverview {
  balance: number
  balance_week_delta: number
  warehouse: WarehouseSummary
  servers_online: number
  servers_total: number
  month_txns: number
  month_in: number
  month_out: number
}

/* ---------------- 管理端：服务器凭证（后端已实现） ---------------- */

/** 管理端服务器记录：与 POST /api/v1/admin/servers/list 响应一致，不含凭证 */
export interface AdminServer {
  id: SnowflakeID
  server_name: string
  enabled: boolean
  created_at: string
  updated_at: string
  /** 最近一次 gRPC 认证时间（展示用，提案字段） */
  last_seen_at?: string
}

/** 一次性凭证交付：创建与轮换成功后返回，中心不保存明文 */
export interface ServerSecret {
  id: SnowflakeID
  secret: string
}

/* ---------------- 管理端：账户 / 配置 / 审计（部分提案） ---------------- */

export type AdminAccountStatus = 'normal' | 'cooldown' | 'deleted'

export interface AdminAccount {
  id: SnowflakeID
  player_name: string
  is_admin: boolean
  status: AdminAccountStatus
  created_at: string
  last_login_at?: string
}

export type AuditActorType = 'player' | 'server' | 'admin' | 'system'

export interface AuditEvent {
  id: SnowflakeID
  time: string
  actor_type: AuditActorType
  actor_name: string
  event: string
  server_name?: string
  detail?: string
}

export interface SystemConfigItem {
  key: string
  label: string
  value: number
  unit: string
  min: number
  max: number
  description: string
}

/** 管理端概览统计（提案契约） */
export interface AdminStats {
  servers_total: number
  servers_online: number
  accounts_total: number
  accounts_cooldown: number
  today_logins: number
  today_warehouse_txns: number
}
