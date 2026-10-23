# RealmMesh 前端计划与契约说明

更新：2026-10-24。阶段 1（完整页面 + 公共组件 + 基础设施 + mock 数据层）已交付并通过浏览器验收。本文记录阶段划分、接口契约状态与后续接入方式，是前后端对接的工作基准。

## 阶段划分（用户确认：按阶段推进，不逐页小步）

| 阶段 | 内容 | 状态 |
| --- | --- | --- |
| 0 | 四套风格静态原型（prototypes/），选定 **B 明亮工坊** | 已完成 |
| 1 | 工程骨架 + 基础设施 + 公共组件 + 玩家端 8 页 + 管理后台 5 页（mock 数据） | 已交付并通过用户验收（2026-10-24） |
| 2 | 接入真实认证 API：注册/登录/改密（HTTP 版）+ JWT 会话管理 + 路由守卫对齐 | 待开始 |
| 3 | 资产类接口（余额/仓库/动态/服务器状态）——需后端先开发 HTTP 资产接口 | 待后端排期 |
| 4 | 体验完善：代码分割（当前单 chunk 788KB）、错误重试策略、空态细化、e2e 冒烟 | 待开始 |

## 接口契约状态（src/lib/api/endpoints.ts）

**已实现**（与 realmmesh-server 路由一一对应，字段名对齐 handler 源码）：
- `POST /api/v1/auth/register` → 201 `{id:string, player_name, is_admin}`
- `POST /api/v1/auth/login` → `{access_token, token_type:"Bearer", expires_at, user_id:string, player_name}`；错误 metadata：`remaining_attempts` / `retry_after_seconds`+`cooldown_until`（429 附 Retry-After）
- `POST /api/v1/auth/me`、`POST /api/v1/admin/me`
- `POST /api/v1/admin/servers/{create,list,detail,set-enabled,rotate-secret,delete}`；create/rotate 一次性交付 `{id, secret}`
- `POST /api/v1/admin/users/delete`（禁删管理员 → `ADMIN_DELETION_FORBIDDEN`）
- `POST /api/v1/admin/warehouse/{policy,set-policy}`

**提案**（后端实现时如有差异以服务端为准，同步此表与 types.ts）：
- `POST /api/v1/auth/change-password`（当前改密仅有 gRPC；HTTP 版按同一业务规则提案：旧密码错误共享失败计数）
- 玩家端资产：`/api/v1/assets/overview`、`/api/v1/warehouse/items`、`/api/v1/activity/list`、`/api/v1/servers/list`
- 管理端运营：`/api/v1/admin/stats`、`/api/v1/admin/accounts/list`、`/api/v1/admin/audit/list`、`/api/v1/admin/system-configs/{list,update}`

**错误结构**：Kratos 编码 `{code, reason, message, metadata}`，统一映射为前端 `ApiError`；reason 清单见 `types.ts` 的 `ApiReason`（与 handler/errors.go 对齐）。

**传输约束**：全 POST JSON（除 `GET /healthz`）、`Authorization: Bearer <token>`、JWT 2 小时无刷新、雪花 ID 序列化为字符串。

## mock 行为约定（src/lib/api/mock-api.ts）

- 登录失败/休息期规则与中心一致：第 N 次失败立即冷却、冷却内不验密码、不续期、到期清零、成功清零；改密旧密码错误共享计数
- 会话持久化在 `localStorage.rm_mock_session`，登出由前端 `clearMockSession()` 清理；页面刷新后 mock 会话自动恢复
- 演示账号 `admin/admin123`；密码含 `fail` 模拟错误

## 设计规范（阶段 1 落地）

- 设计 token 见 `src/index.css` `@theme`（paper/em/em-soft/warn/grape/danger/line 全套 + 圆角 + 阴影），与 B 原型一致
- 像素物品图标：`components/pix-data.ts`（box-shadow 渲染，新增物品补图样即可）
- **交互稳定性（用户明确要求）**：入场动画为轻淡入（4px/0.3s）；路由切换 ScrollToTop 回顶；`scrollbar-gutter: stable` 防横向抖动；内容区 min-height 防高度跳变；骨架屏与内容尺寸匹配；hover 用 transform 不触发回流
- 信任边界在 UI 中的体现：存入/取出在 Web 端只给说明弹窗（操作在游戏内）；一次性凭证仅弹窗展示一次；账户删除仅管理员

## 已知边界与后续项

- 生产构建单 chunk 788KB（framer-motion + radix + fontsource 所致），阶段 4 做路由级代码分割
- `servers` 页延迟柱状图为静态演示数据，接真实接口后换采样序列
- 管理端 `system-configs` 仅展示 `auth.max_failures`、`auth.cooldown_seconds` 两个已确认键，不虚构配置项
- e2e/单测未建立；阶段 2 接真实 API 时优先补认证流的关键路径测试
