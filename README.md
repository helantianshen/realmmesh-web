# realmmesh-web

RealmMesh 玩家资产管理与管理后台前端。当前为**阶段 1**：全部页面 + 公共组件 + 基础设施已就绪，数据由 mock 层承载，待后端接口就绪后统一接入。

视觉基准：`prototypes/style-b-craft-light.html`（明亮工坊 / Craft Light，浅色 SaaS 风格）。

## 快速开始

```bash
npm install        # .npmrc 已指向 npmmirror，可按需移除
npm run dev        # http://127.0.0.1:5174（strictPort）
npm run build      # tsc -b && vite build
npm run preview    # 预览生产构建（默认 4173）
```

> 本机 Node 经由 `~/.local/node24/bin`（xlings 的 node 转发在 ZCode 沙箱内不可用）。若终端 node 可用可忽略。

### 演示账号

| 场景 | 操作 |
| --- | --- |
| 普通账户 | 任意符合规则的玩家名/密码登录或注册 |
| 管理员 | `admin` / `admin123` |
| 密码错误 | 密码含 `fail`（如 `fail123`）→ 剩余次数提示 |
| 休息期 | 同一玩家名连续 3 次失败 → 5 分钟冷却（倒计时实时显示，冷却中正确密码也被拒） |

## 技术栈

React 19 · TypeScript · Vite · Tailwind CSS v4（CSS-first token）· Radix UI（dialog/tabs/dropdown/tooltip/switch/label）· TanStack Query · React Hook Form + Zod · framer-motion · lucide-react

## 目录结构

```
src/
  lib/api/       # 类型化 API 契约（contract.ts）+ mock 实现 + 端点表（endpoints.ts）
  ui/            # 基础组件（button/input/dialog/tabs/toast/...）
  components/    # 业务公共组件（AppShell/AdminLayout/AuthLayout/像素图标/统计卡/...）
  hooks/         # AuthProvider / useAuth
  pages/         # 玩家端 8 页 + admin/ 管理后台 5 页
prototypes/      # 四套风格静态原型（A/B/C/D + 入口页），设计参考用
```

## 接入真实后端

页面只依赖 `src/lib/api/contract.ts` 的 `RealmMeshApi` 接口。接入时新建 `http-api.ts` 用 fetch 实现同一接口（端点与错误码映射见 `endpoints.ts`，已实现的认证/管理路由与 `realmmesh-server` 一一对应），然后在 `src/lib/api/index.ts` 把 `createMockApi()` 换成真实实现即可，页面代码无需改动。

契约细节与提案接口清单见 `docs/FRONTEND_PLAN.md`。
