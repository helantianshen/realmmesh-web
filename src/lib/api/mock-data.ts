/** mock 种子数据：仅用于前端开发与演示，与真实中心数据库无关。
 *  演示账号：admin / admin123（管理员）；任意符合规则的账号密码可登录普通账户；
 *  密码中包含 "fail" 时模拟密码错误，连续 3 次触发休息期。 */

import type {
  ActivityRecord,
  AdminAccount,
  AdminServer,
  AdminStats,
  AssetsOverview,
  AuditEvent,
  PlayerServer,
  SystemConfigItem,
  WarehouseItem,
} from './types'

const H = 3600_000
const now = Date.now()
const ago = (h: number) => new Date(now - h * H).toISOString()

export const ADMIN_NAME = 'admin'
export const ADMIN_PASSWORD = 'admin123'

export const seedWarehouseItems: WarehouseItem[] = [
  { id: '7391001', name: '钻石', category: 'mat', rare: true, count: 64, source_server: '生存一服', updated_at: ago(2), note: '整组存入，未拆封' },
  { id: '7391002', name: '金锭', category: 'mat', rare: false, count: 128, source_server: '创造服', updated_at: ago(9) },
  { id: '7391003', name: '绿宝石', category: 'mat', rare: false, count: 32, source_server: '生存一服', updated_at: ago(26) },
  { id: '7391004', name: '下界合金锭', category: 'mat', rare: true, count: 12, source_server: '生存一服', updated_at: ago(50), note: '高价值物品' },
  { id: '7391005', name: '末影珍珠', category: 'mat', rare: false, count: 16, source_server: '小游戏服', updated_at: ago(30) },
  { id: '7391006', name: '喷溅治疗药水', category: 'use', rare: false, count: 6, source_server: '小游戏服', updated_at: ago(8) },
  { id: '7391007', name: '附魔书 · 经验修补', category: 'tool', rare: true, count: 1, source_server: '模组服', updated_at: ago(28), note: '模组服特有附魔，取出前请确认目标服支持' },
  { id: '7391008', name: '白色混凝土', category: 'build', rare: false, count: 256, source_server: '创造服', updated_at: ago(74) },
  { id: '7391009', name: 'TNT', category: 'redstone', rare: false, count: 8, source_server: '生存一服', updated_at: ago(96), note: '危险品，取出需二次确认' },
  { id: '7391010', name: '铁块', category: 'build', rare: false, count: 64, source_server: '生存一服', updated_at: ago(120) },
  { id: '7391011', name: '望远镜', category: 'tool', rare: false, count: 2, source_server: '模组服', updated_at: ago(140) },
  { id: '7391012', name: '面包', category: 'use', rare: false, count: 32, source_server: '生存一服', updated_at: ago(160) },
]

export const seedActivity: ActivityRecord[] = [
  { id: 'a1', type: 'in', title: '存入 钻石 ×64', server_name: '生存一服', detail: '已入库', time: ago(2) },
  { id: 'a2', type: 'out', title: '取出 金锭 ×32', server_name: '创造服', detail: '已发放至背包', time: ago(3.5) },
  { id: 'a3', type: 'bonus', title: '登录奖励 +50 金币', detail: 'Web 端', time: ago(7) },
  { id: 'a4', type: 'in', title: '存入 喷溅治疗药水 ×6', server_name: '小游戏服', time: ago(8) },
  { id: 'a5', type: 'out', title: '取出 末影珍珠 ×16', server_name: '小游戏服', detail: '已发放至背包', time: ago(11) },
  { id: 'a6', type: 'security', title: '修改密码成功', detail: '所有已连接游戏服会话已踢出', time: ago(24) },
  { id: 'a7', type: 'in', title: '存入 附魔书 ×1', server_name: '模组服', time: ago(28) },
  { id: 'a8', type: 'in', title: '存入 绿宝石 ×32', server_name: '生存一服', time: ago(26) },
  { id: 'a9', type: 'out', title: '取出 面包 ×32', server_name: '生存一服', time: ago(30) },
  { id: 'a10', type: 'bonus', title: '登录奖励 +50 金币', detail: 'Web 端', time: ago(31) },
  { id: 'a11', type: 'in', title: '存入 下界合金锭 ×12', server_name: '生存一服', time: ago(50) },
  { id: 'a12', type: 'out', title: '取出 TNT ×8', server_name: '生存一服', detail: '危险品二次确认', time: ago(96) },
  { id: 'a13', type: 'in', title: '存入 白色混凝土 ×256', server_name: '创造服', time: ago(74) },
  { id: 'a14', type: 'in', title: '存入 铁块 ×64', server_name: '生存一服', time: ago(120) },
  { id: 'a15', type: 'in', title: '存入 望远镜 ×2', server_name: '模组服', time: ago(140) },
  { id: 'a16', type: 'security', title: '新设备登录', detail: 'Web 端 · JWT 有效期 2 小时', time: ago(150) },
  { id: 'a17', type: 'out', title: '取出 钻石 ×32', server_name: '生存一服', time: ago(170) },
  { id: 'a18', type: 'bonus', title: '跨服同步奖励 +120 金币', detail: '首次跨服取出', time: ago(190) },
  { id: 'a19', type: 'in', title: '存入 面包 ×32', server_name: '生存一服', time: ago(160) },
  { id: 'a20', type: 'in', title: '存入 末影珍珠 ×16', server_name: '小游戏服', time: ago(200) },
  { id: 'a21', type: 'out', title: '取出 望远镜 ×1', server_name: '模组服', time: ago(220) },
  { id: 'a22', type: 'bonus', title: '登录奖励 +50 金币', detail: 'Web 端', time: ago(230) },
]

export const seedPlayerServers: PlayerServer[] = [
  { id: 's1', name: 'survival-1', title: '生存一服', status: 'online', ping_ms: 12 },
  { id: 's2', name: 'creative', title: '创造服', status: 'online', ping_ms: 23 },
  { id: 's3', name: 'games', title: '小游戏服', status: 'online', ping_ms: 41 },
  { id: 's4', name: 'modded', title: '模组服', status: 'maintenance', ping_ms: null },
]

export const seedAssetsOverview: AssetsOverview = {
  balance: 12480,
  balance_week_delta: 320,
  warehouse: { used_slots: 238, total_slots: 320 },
  servers_online: 3,
  servers_total: 4,
  month_txns: 86,
  month_in: 61,
  month_out: 25,
}

export const seedAdminServers: AdminServer[] = [
  { id: '9001', server_name: 'survival-1', enabled: true, created_at: ago(24 * 30), updated_at: ago(2), last_seen_at: ago(0.1) },
  { id: '9002', server_name: 'creative', enabled: true, created_at: ago(24 * 22), updated_at: ago(24), last_seen_at: ago(0.2) },
  { id: '9003', server_name: 'games', enabled: true, created_at: ago(24 * 15), updated_at: ago(24 * 3), last_seen_at: ago(0.3) },
  { id: '9004', server_name: 'modded', enabled: false, created_at: ago(24 * 8), updated_at: ago(5), last_seen_at: ago(30) },
  { id: '9005', server_name: 'test-node', enabled: true, created_at: ago(24 * 2), updated_at: ago(24 * 2), last_seen_at: ago(24) },
]

export const seedAdminAccounts: AdminAccount[] = [
  { id: '7001', player_name: 'admin', is_admin: true, status: 'normal', created_at: ago(24 * 60), last_login_at: ago(1) },
  { id: '7002', player_name: 'Alex_Craft', is_admin: false, status: 'normal', created_at: ago(24 * 30), last_login_at: ago(2) },
  { id: '7003', player_name: 'Steve_Miner', is_admin: false, status: 'normal', created_at: ago(24 * 28), last_login_at: ago(20) },
  { id: '7004', player_name: 'EnderFox', is_admin: false, status: 'cooldown', created_at: ago(24 * 20), last_login_at: ago(26) },
  { id: '7005', player_name: 'Redstone_King', is_admin: false, status: 'normal', created_at: ago(24 * 18), last_login_at: ago(30) },
  { id: '7006', player_name: 'CreeperChan', is_admin: false, status: 'normal', created_at: ago(24 * 15), last_login_at: ago(45) },
  { id: '7007', player_name: 'NetherWalker', is_admin: false, status: 'normal', created_at: ago(24 * 12), last_login_at: ago(50) },
  { id: '7008', player_name: 'Diamond_Hunter', is_admin: false, status: 'normal', created_at: ago(24 * 10), last_login_at: ago(70) },
  { id: '7009', player_name: 'Pixel_Builder', is_admin: false, status: 'normal', created_at: ago(24 * 9), last_login_at: ago(80) },
  { id: '7010', player_name: 'Villager_Trader', is_admin: false, status: 'deleted', created_at: ago(24 * 8), last_login_at: ago(24 * 9) },
  { id: '7011', player_name: 'SlimeJump', is_admin: false, status: 'normal', created_at: ago(24 * 6), last_login_at: ago(100) },
  { id: '7012', player_name: 'ObsidianWall', is_admin: false, status: 'normal', created_at: ago(24 * 5), last_login_at: ago(120) },
  { id: '7013', player_name: 'GoldenApple', is_admin: false, status: 'normal', created_at: ago(24 * 4), last_login_at: ago(130) },
  { id: '7014', player_name: 'SkyBlocker', is_admin: false, status: 'cooldown', created_at: ago(24 * 3), last_login_at: ago(140) },
  { id: '7015', player_name: 'WolfTamer', is_admin: false, status: 'normal', created_at: ago(24 * 2), last_login_at: ago(150) },
  { id: '7016', player_name: 'MapArtistor', is_admin: false, status: 'normal', created_at: ago(24), last_login_at: ago(160) },
]

export const seedAuditEvents: AuditEvent[] = [
  { id: 'u1', time: ago(0.2), actor_type: 'server', actor_name: 'survival-1', event: 'player.join', server_name: 'survival-1', detail: 'Steve_Miner 进入服务器' },
  { id: 'u2', time: ago(0.5), actor_type: 'player', actor_name: 'Alex_Craft', event: 'warehouse.in', server_name: 'survival-1', detail: '钻石 ×64 存入仓库' },
  { id: 'u3', time: ago(1), actor_type: 'admin', actor_name: 'admin', event: 'server.rotate_secret', detail: 'survival-1 轮换凭证' },
  { id: 'u4', time: ago(1.5), actor_type: 'player', actor_name: 'Alex_Craft', event: 'auth.login', detail: 'Web 端登录成功' },
  { id: 'u5', time: ago(2), actor_type: 'player', actor_name: 'EnderFox', event: 'auth.cooldown', server_name: 'games', detail: '连续 3 次密码错误，进入休息期' },
  { id: 'u6', time: ago(3), actor_type: 'server', actor_name: 'creative', event: 'player.leave', server_name: 'creative', detail: 'Pixel_Builder 离开服务器' },
  { id: 'u7', time: ago(4), actor_type: 'player', actor_name: 'GoldenApple', event: 'account.register', detail: '新账户注册' },
  { id: 'u8', time: ago(5), actor_type: 'admin', actor_name: 'admin', event: 'server.set_disabled', detail: 'modded 停用，维护中' },
  { id: 'u9', time: ago(6), actor_type: 'player', actor_name: 'CreeperChan', event: 'account.password_changed', server_name: 'survival-1', detail: '改密成功，在线会话踢出' },
  { id: 'u10', time: ago(8), actor_type: 'player', actor_name: 'Diamond_Hunter', event: 'warehouse.out', server_name: 'games', detail: '末影珍珠 ×16 取出' },
  { id: 'u11', time: ago(10), actor_type: 'admin', actor_name: 'admin', event: 'config.update', detail: 'auth.cooldown_seconds 保持 300' },
  { id: 'u12', time: ago(12), actor_type: 'server', actor_name: 'modded', event: 'server.registered', detail: '服务器接入登记' },
  { id: 'u13', time: ago(15), actor_type: 'player', actor_name: 'MapArtistor', event: 'auth.login', server_name: 'creative', detail: '游戏内进服登录' },
  { id: 'u14', time: ago(18), actor_type: 'system', actor_name: 'center', event: 'config.hot_reload', detail: '登录时限配置热更新' },
  { id: 'u15', time: ago(20), actor_type: 'player', actor_name: 'WolfTamer', event: 'warehouse.in', server_name: 'survival-1', detail: '铁块 ×64 存入' },
  { id: 'u16', time: ago(24), actor_type: 'admin', actor_name: 'admin', event: 'account.delete', detail: 'Villager_Trader 账户删除' },
]

export const seedSystemConfigs: SystemConfigItem[] = [
  {
    key: 'auth.max_failures',
    label: '最大登录失败次数',
    value: 3,
    unit: '次',
    min: 1,
    max: 10,
    description: '第 N 次失败立即进入休息期；全中心统一，不按服务器区分。',
  },
  {
    key: 'auth.cooldown_seconds',
    label: '休息期时长',
    value: 300,
    unit: '秒',
    min: 30,
    max: 3600,
    description: '休息期内即使密码正确也无法登录；到期后从零重新计数。',
  },
]

export const seedAdminStats: AdminStats = {
  servers_total: 5,
  servers_online: 3,
  accounts_total: 15,
  accounts_cooldown: 2,
  today_logins: 47,
  today_warehouse_txns: 23,
}
