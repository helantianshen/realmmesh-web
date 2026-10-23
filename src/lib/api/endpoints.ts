/** HTTP 端点清单：标记「已实现」的与 realmmesh-server 当前路由一一对应；
 *  标记「提案」的为前端先行契约，后端实现时如有差异以服务端为准并同步此表。 */

export const EP = {
  /** 已实现：账户认证 */
  register: 'POST /api/v1/auth/register',
  login: 'POST /api/v1/auth/login',
  me: 'POST /api/v1/auth/me',
  adminMe: 'POST /api/v1/admin/me',

  /** 提案：改密（当前仅有 gRPC 版，HTTP 版按同一业务规则提案） */
  changePassword: 'POST /api/v1/auth/change-password',

  /** 已实现：管理端服务器凭证 */
  serverCreate: 'POST /api/v1/admin/servers/create',
  serverList: 'POST /api/v1/admin/servers/list',
  serverDetail: 'POST /api/v1/admin/servers/detail',
  serverSetEnabled: 'POST /api/v1/admin/servers/set-enabled',
  serverRotateSecret: 'POST /api/v1/admin/servers/rotate-secret',
  serverDelete: 'POST /api/v1/admin/servers/delete',

  /** 已实现：管理端账户删除 */
  userDelete: 'POST /api/v1/admin/users/delete',

  /** 已实现：管理端仓库策略 */
  warehousePolicy: 'POST /api/v1/admin/warehouse/policy',
  warehouseSetPolicy: 'POST /api/v1/admin/warehouse/set-policy',

  /** 提案：玩家端资产（后端待实现） */
  assetsOverview: 'POST /api/v1/assets/overview',
  warehouseItems: 'POST /api/v1/warehouse/items',
  warehouseSummary: 'POST /api/v1/warehouse/summary',
  activityList: 'POST /api/v1/activity/list',
  playerServers: 'POST /api/v1/servers/list',

  /** 提案：管理端运营数据（后端待实现） */
  adminStats: 'POST /api/v1/admin/stats',
  adminAccounts: 'POST /api/v1/admin/accounts/list',
  adminAudit: 'POST /api/v1/admin/audit/list',
  adminSystemConfigs: 'POST /api/v1/admin/system-configs/list',
  adminSystemConfigUpdate: 'POST /api/v1/admin/system-configs/update',
} as const
