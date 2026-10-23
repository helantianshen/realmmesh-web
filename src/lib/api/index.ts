/** API 出口：当前绑定 mock 实现。
 *  接入真实后端时：新建 http-api.ts 实现 RealmMeshApi（fetch 封装见 endpoints.ts 端点表，
 *  全部 POST、Authorization: Bearer <token>、Kratos 错误结构映射为 ApiError），
 *  然后把下面的 createMockApi() 换成 createHttpApi() 即可，页面代码无需改动。 */

import { createMockApi, clearMockSession } from './mock-api'
import type { RealmMeshApi } from './contract'

export const api: RealmMeshApi = createMockApi()
export { clearMockSession }

export { ApiError, isApiError } from './errors'
export { EP } from './endpoints'
export type * from './types'
export type * from './contract'
