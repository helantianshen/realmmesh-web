/** mock API 实现：内存状态 + 模拟延迟 + 可演示的失败/休息期行为。
 *  规则对齐中心业务：失败 N 次进入休息期、休息期内不校验密码、到期从零计数、
 *  成功登录清零；改密的旧密码错误与登录共享计数。
 *  页面全部通过 contract.ts 接口调用，不感知此实现。 */

import { ApiError } from './errors'
import {
  ADMIN_NAME,
  ADMIN_PASSWORD,
  seedActivity,
  seedAdminAccounts,
  seedAdminServers,
  seedAdminStats,
  seedAssetsOverview,
  seedAuditEvents,
  seedPlayerServers,
  seedSystemConfigs,
  seedWarehouseItems,
} from './mock-data'
import type { RealmMeshApi } from './contract'
import type {
  Account,
  LoginResult,
  SnowflakeID,
} from './types'
import { sleep } from '@/lib/utils'

/** 会话态：跨页面共享的当前登录账户（mock 内部使用） */
interface MockSession {
  account: Account
  password: string
  issuedAt: number
}

interface FailureState {
  count: number
  cooldownUntil: number
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    page_size: pageSize,
  }
}

function randomSecret() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function newId() {
  return String(Date.now()) + String(Math.floor(Math.random() * 900 + 100))
}

function requireAdmin(session: MockSession | null) {
  if (!session) throw new ApiError({ status: 401, reason: 'UNAUTHORIZED', message: '请重新登录' })
  if (!session.account.is_admin) {
    throw new ApiError({ status: 403, reason: 'ADMIN_REQUIRED', message: '需要管理员权限' })
  }
}

function requireSession(session: MockSession | null) {
  if (!session) throw new ApiError({ status: 401, reason: 'UNAUTHORIZED', message: '请重新登录' })
}



export function createMockApi(): RealmMeshApi {
  /** 全局单例状态：模块内闭包持有；演示会话跟随 realmmesh_web_session 生命周期 */
  let session: MockSession | null = null
  const failures = new Map<string, FailureState>()
  const takenNames = new Set<string>(seedAdminAccounts.map((a) => a.player_name.toLowerCase()))
  const registered = new Map<string, { password: string; account: Account }>()

  /** 页面刷新后从演示存储恢复登录态；登出由前端调用 clearMockSession 显式清理 */
  function currentSession(): MockSession | null {
    if (session) return session
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem('rm_mock_session')
    if (!raw) return null
    try {
      session = JSON.parse(raw) as MockSession
    } catch {
      session = null
    }
    return session
  }

  function persistSession(next: MockSession | null) {
    session = next
    if (typeof localStorage === 'undefined') return
    if (next) localStorage.setItem('rm_mock_session', JSON.stringify(next))
    else localStorage.removeItem('rm_mock_session')
  }

  const adminServers = [...seedAdminServers]
  const adminAccounts = [...seedAdminAccounts]
  const auditEvents = [...seedAuditEvents]
  const systemConfigs = seedSystemConfigs.map((c) => ({ ...c }))
  let warehousePolicy = { capacity_slots: 320 }

  const maxFailures = () => systemConfigs.find((c) => c.key === 'auth.max_failures')?.value ?? 3
  const cooldownSeconds = () => systemConfigs.find((c) => c.key === 'auth.cooldown_seconds')?.value ?? 300

  function failureOf(name: string): FailureState {
    const key = name.toLowerCase()
    let state = failures.get(key)
    if (!state) {
      state = { count: 0, cooldownUntil: 0 }
      failures.set(key, state)
    }
    return state
  }

  /** 与中心一致：休息期内不校验密码，直接拒绝且不延长截止时间 */
  function checkCooldown(name: string) {
    const state = failureOf(name)
    if (state.cooldownUntil > Date.now()) {
      const remain = Math.ceil((state.cooldownUntil - Date.now()) / 1000)
      throw new ApiError({
        status: 429,
        reason: 'COOLING_DOWN',
        message: '登录尝试过多，请稍后重试',
        metadata: {
          retry_after_seconds: String(remain),
          cooldown_until: new Date(state.cooldownUntil).toISOString(),
        },
      })
    }
    if (state.cooldownUntil !== 0 && state.cooldownUntil <= Date.now()) {
      state.count = 0
      state.cooldownUntil = 0
    }
  }

  function recordFailure(name: string) {
    const state = failureOf(name)
    state.count += 1
    if (state.count >= maxFailures()) {
      state.cooldownUntil = Date.now() + cooldownSeconds() * 1000
      const remain = cooldownSeconds()
      throw new ApiError({
        status: 429,
        reason: 'COOLING_DOWN',
        message: '登录尝试过多，请稍后重试',
        metadata: {
          retry_after_seconds: String(remain),
          cooldown_until: new Date(state.cooldownUntil).toISOString(),
        },
      })
    }
    throw new ApiError({
      status: 401,
      reason: 'WRONG_PASSWORD',
      message: '密码错误',
      metadata: { remaining_attempts: String(maxFailures() - state.count) },
    })
  }

  function audit(entry: Omit<(typeof auditEvents)[number], 'id' | 'time'>) {
    auditEvents.unshift({ ...entry, id: newId(), time: new Date().toISOString() })
  }

  const delay = () => sleep(280 + Math.random() * 360)

  return {
    async register(input) {
      await delay()
      const name = input.player_name.trim()
      if (!/^[A-Za-z0-9_]{3,16}$/.test(name)) {
        throw new ApiError({ status: 400, reason: 'PLAYER_NAME_INVALID', message: '玩家名字格式无效' })
      }
      if (!/^[A-Za-z0-9$%&@#^*!]{6,12}$/.test(input.password)) {
        throw new ApiError({ status: 400, reason: 'PASSWORD_INVALID', message: '密码格式无效' })
      }
      if (takenNames.has(name.toLowerCase())) {
        throw new ApiError({ status: 409, reason: 'PLAYER_NAME_TAKEN', message: '玩家名字已被占用' })
      }
      takenNames.add(name.toLowerCase())
      const account: Account = { id: newId(), player_name: name, is_admin: false }
      registered.set(name.toLowerCase(), { password: input.password, account })
      adminAccounts.unshift({
        id: account.id,
        player_name: name,
        is_admin: false,
        status: 'normal',
        created_at: new Date().toISOString(),
      })
      audit({ actor_type: 'player', actor_name: name, event: 'account.register', detail: '新账户注册' })
      return account
    },

    async login(input) {
      await delay()
      const name = input.player_name.trim()
      checkCooldown(name)

      const known =
        name.toLowerCase() === ADMIN_NAME.toLowerCase()
          ? { password: ADMIN_PASSWORD, account: { id: '7001', player_name: ADMIN_NAME, is_admin: true } as Account }
          : registered.get(name.toLowerCase())

      // mock 演示约定：密码包含 "fail" 视为密码错误，便于体验错误态与休息期
      const passwordOk = known ? input.password === known.password : input.password.includes('fail') ? false : true
      if (!passwordOk) recordFailure(name)

      const account: Account = known
        ? known.account
        : { id: newId(), player_name: name, is_admin: false }
      if (!known) {
        takenNames.add(name.toLowerCase())
        registered.set(name.toLowerCase(), { password: input.password, account })
      }

      failureOf(name).count = 0
      persistSession({ account, password: input.password, issuedAt: Date.now() })
      const result: LoginResult = {
        access_token: `mock.jwt.${randomSecret().slice(0, 24)}`,
        token_type: 'Bearer',
        expires_at: new Date(Date.now() + 2 * 3600_000).toISOString(),
        user_id: account.id,
        player_name: account.player_name,
      }
      audit({ actor_type: 'player', actor_name: account.player_name, event: 'auth.login', detail: 'Web 端登录成功' })
      return result
    },

    async me() {
      await delay()
      const current = currentSession()
      requireSession(current)
      return current!.account
    },

    async changePassword(input) {
      await delay()
      const current = currentSession()
      requireSession(current)
      checkCooldown(current!.account.player_name)
      if (input.old_password !== current!.password) {
        recordFailure(current!.account.player_name)
      }
      current!.password = input.new_password
      persistSession(current)
      audit({
        actor_type: 'player',
        actor_name: currentSession()!.account.player_name,
        event: 'account.password_changed',
        detail: '改密成功，所有已连接游戏服会话踢出',
      })
    },

    async assetsOverview() {
      await delay()
      requireSession(currentSession())
      return seedAssetsOverview
    },

    async warehouseItems(query) {
      await delay()
      requireSession(currentSession())
      let items = [...seedWarehouseItems]
      if (query.category && query.category !== 'all') {
        items = items.filter((i) => i.category === query.category)
      }
      if (query.search?.trim()) {
        const q = query.search.trim().toLowerCase()
        items = items.filter((i) => i.name.toLowerCase().includes(q))
      }
      return paginate(items, query.page, query.page_size)
    },

    async activityList(query) {
      await delay()
      requireSession(currentSession())
      let items = [...seedActivity]
      if (query.type && query.type !== 'all') {
        items = items.filter((a) => a.type === query.type)
      }
      return paginate(items, query.page, query.page_size)
    },

    async playerServers() {
      await delay()
      requireSession(currentSession())
      return seedPlayerServers
    },

    async adminServerCreate(input) {
      await delay()
      requireAdmin(currentSession())
      const name = input.server_name.trim()
      if (!/^[\u4e00-\u9fa5A-Za-z0-9_-]{2,24}$/.test(name)) {
        throw new ApiError({ status: 400, reason: 'SERVER_NAME_INVALID', message: '服务器名称格式无效' })
      }
      if (adminServers.some((s) => s.server_name === name)) {
        throw new ApiError({ status: 409, reason: 'SERVER_NAME_INVALID', message: '服务器名称已存在' })
      }
      const id = newId()
      adminServers.unshift({
        id,
        server_name: name,
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      audit({ actor_type: 'admin', actor_name: currentSession()!.account.player_name, event: 'server.create', detail: `${name} 接入登记` })
      return { id, secret: randomSecret() }
    },

    async adminServerList(query) {
      await delay()
      requireAdmin(currentSession())
      return paginate(adminServers, query.page, query.page_size)
    },

    async adminServerSetEnabled(input) {
      await delay()
      requireAdmin(currentSession())
      const server = adminServers.find((s) => s.id === input.server_id)
      if (!server) throw new ApiError({ status: 404, reason: 'SERVER_NOT_FOUND', message: '服务器不存在' })
      server.enabled = input.enabled
      server.updated_at = new Date().toISOString()
      audit({
        actor_type: 'admin',
        actor_name: currentSession()!.account.player_name,
        event: input.enabled ? 'server.set_enabled' : 'server.set_disabled',
        detail: `${server.server_name} ${input.enabled ? '启用' : '停用'}，立即影响后续认证`,
      })
    },

    async adminServerRotateSecret(input) {
      await delay()
      requireAdmin(currentSession())
      const server = adminServers.find((s) => s.id === input.server_id)
      if (!server) throw new ApiError({ status: 404, reason: 'SERVER_NOT_FOUND', message: '服务器不存在' })
      server.updated_at = new Date().toISOString()
      audit({
        actor_type: 'admin',
        actor_name: currentSession()!.account.player_name,
        event: 'server.rotate_secret',
        detail: `${server.server_name} 轮换凭证`,
      })
      return { id: server.id, secret: randomSecret() }
    },

    async adminServerDelete(input) {
      await delay()
      requireAdmin(currentSession())
      const idx = adminServers.findIndex((s) => s.id === input.server_id)
      if (idx === -1) throw new ApiError({ status: 404, reason: 'SERVER_NOT_FOUND', message: '服务器不存在' })
      const [removed] = adminServers.splice(idx, 1)
      audit({
        actor_type: 'admin',
        actor_name: currentSession()!.account.player_name,
        event: 'server.delete',
        detail: `${removed.server_name} 删除登记，历史审计保留`,
      })
    },

    async adminUserDelete(input) {
      await delay()
      requireAdmin(currentSession())
      const account = adminAccounts.find((a) => a.id === input.user_id)
      if (!account) throw new ApiError({ status: 404, reason: 'ACCOUNT_NOT_FOUND', message: '账户不存在' })
      if (account.is_admin) {
        throw new ApiError({ status: 403, reason: 'ADMIN_DELETION_FORBIDDEN', message: '禁止删除管理员账户' })
      }
      account.status = 'deleted'
      audit({
        actor_type: 'admin',
        actor_name: currentSession()!.account.player_name,
        event: 'account.delete',
        detail: `${account.player_name} 账户删除`,
      })
    },

    async adminAccounts(query) {
      await delay()
      requireAdmin(currentSession())
      let items = adminAccounts.filter((a) => a.status !== 'deleted' || query.search)
      if (query.search?.trim()) {
        const q = query.search.trim().toLowerCase()
        items = adminAccounts.filter((a) => a.player_name.toLowerCase().includes(q))
      }
      return paginate(items, query.page, query.page_size)
    },

    async adminAudit(query) {
      await delay()
      requireAdmin(currentSession())
      let items = [...auditEvents]
      if (query.search?.trim()) {
        const q = query.search.trim().toLowerCase()
        items = items.filter(
          (e) =>
            e.actor_name.toLowerCase().includes(q) ||
            (e.server_name ?? '').toLowerCase().includes(q) ||
            (e.detail ?? '').toLowerCase().includes(q),
        )
      }
      return paginate(items, query.page, query.page_size)
    },

    async adminStats() {
      await delay()
      requireAdmin(currentSession())
      return {
        ...seedAdminStats,
        servers_total: adminServers.length,
        servers_online: adminServers.filter((s) => s.enabled).length,
        accounts_total: adminAccounts.filter((a) => a.status !== 'deleted').length,
        accounts_cooldown: adminAccounts.filter((a) => a.status === 'cooldown').length,
      }
    },

    async adminSystemConfigs() {
      await delay()
      requireAdmin(currentSession())
      return systemConfigs.map((c) => ({ ...c }))
    },

    async adminSystemConfigUpdate(input) {
      await delay()
      requireAdmin(currentSession())
      const config = systemConfigs.find((c) => c.key === input.key)
      if (!config) throw new ApiError({ status: 400, reason: 'INVALID_REQUEST', message: '未知配置项' })
      if (!Number.isInteger(input.value) || input.value < config.min || input.value > config.max) {
        throw new ApiError({ status: 400, reason: 'INVALID_REQUEST', message: `取值需在 ${config.min}–${config.max} 之间` })
      }
      config.value = input.value
      audit({
        actor_type: 'admin',
        actor_name: currentSession()!.account.player_name,
        event: 'config.update',
        detail: `${config.key} 调整为 ${input.value}`,
      })
      return { ...config }
    },

    async adminWarehousePolicy() {
      await delay()
      requireAdmin(currentSession())
      return { ...warehousePolicy }
    },

    async adminWarehouseSetPolicy(input) {
      await delay()
      requireAdmin(currentSession())
      warehousePolicy = { ...warehousePolicy, ...input }
      audit({
        actor_type: 'admin',
        actor_name: currentSession()!.account.player_name,
        event: 'warehouse.policy_update',
        detail: `仓库容量调整为 ${warehousePolicy.capacity_slots} 格`,
      })
      return { ...warehousePolicy }
    },
  }
}


/** 登出时由前端调用，清理 mock 演示会话（对应未来真实后端的令牌废弃） */
export function clearMockSession() {
  localStorage.removeItem('rm_mock_session')
}

export type { SnowflakeID }
