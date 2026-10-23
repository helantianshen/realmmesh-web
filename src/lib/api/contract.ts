/** 前端统一 API 契约：页面只依赖此接口，不感知传输实现。
 *  当前由 mock 实现承载（mock-api.ts），后端就绪后用 HttpApi 实现同一接口替换。 */

import type {
  Account,
  ActivityRecord,
  ActivityType,
  AdminAccount,
  AdminServer,
  AdminStats,
  AssetsOverview,
  AuditEvent,
  ItemCategory,
  LoginResult,
  PageRequest,
  PageResult,
  PlayerServer,
  ServerSecret,
  SystemConfigItem,
  WarehouseItem,
} from './types'

export interface ChangePasswordInput {
  old_password: string
  new_password: string
}

export interface WarehouseQuery extends PageRequest {
  category?: ItemCategory | 'all'
  search?: string
}

export interface ActivityQuery extends PageRequest {
  type?: ActivityType | 'all'
}

export interface AccountsQuery extends PageRequest {
  search?: string
}

export interface AuditQuery extends PageRequest {
  search?: string
}

export interface ServerCreateInput {
  server_name: string
}

export interface ServerSetEnabledInput {
  server_id: string
  enabled: boolean
}

export interface ServerRotateInput {
  server_id: string
}

export interface ServerDeleteInput {
  server_id: string
}

export interface UserDeleteInput {
  user_id: string
}

export interface WarehousePolicy {
  capacity_slots: number
}

export interface RealmMeshApi {
  /* ---- 账户 ---- */
  register(input: { player_name: string; password: string }): Promise<Account>
  login(input: { player_name: string; password: string }): Promise<LoginResult>
  me(): Promise<Account>
  changePassword(input: ChangePasswordInput): Promise<void>

  /* ---- 玩家端资产（提案契约） ---- */
  assetsOverview(): Promise<AssetsOverview>
  warehouseItems(query: WarehouseQuery): Promise<PageResult<WarehouseItem>>
  activityList(query: ActivityQuery): Promise<PageResult<ActivityRecord>>
  playerServers(): Promise<PlayerServer[]>

  /* ---- 管理端：服务器凭证（对齐已实现路由） ---- */
  adminServerCreate(input: ServerCreateInput): Promise<ServerSecret>
  adminServerList(query: PageRequest): Promise<PageResult<AdminServer>>
  adminServerSetEnabled(input: ServerSetEnabledInput): Promise<void>
  adminServerRotateSecret(input: ServerRotateInput): Promise<ServerSecret>
  adminServerDelete(input: ServerDeleteInput): Promise<void>

  /* ---- 管理端：账户 / 审计 / 配置 / 统计 ---- */
  adminUserDelete(input: UserDeleteInput): Promise<void>
  adminAccounts(query: AccountsQuery): Promise<PageResult<AdminAccount>>
  adminAudit(query: AuditQuery): Promise<PageResult<AuditEvent>>
  adminStats(): Promise<AdminStats>
  adminSystemConfigs(): Promise<SystemConfigItem[]>
  adminSystemConfigUpdate(input: { key: string; value: number }): Promise<SystemConfigItem>
  adminWarehousePolicy(): Promise<WarehousePolicy>
  adminWarehouseSetPolicy(input: Partial<WarehousePolicy>): Promise<WarehousePolicy>
}
