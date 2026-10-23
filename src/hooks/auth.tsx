import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { api, clearMockSession } from '@/lib/api'
import type { Account, LoginResult } from '@/lib/api'

interface AuthState {
  account: Account
  token: string
  expiresAt: string
}

interface AuthContextValue {
  auth: AuthState | null
  login: (playerName: string, password: string) => Promise<LoginResult>
  register: (playerName: string, password: string) => Promise<Account>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'realmmesh_web_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as AuthState
      if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }
      return parsed
    } catch {
      return null
    }
  })

  /** mock 无服务端会话，持久化仅保留展示态；接真实后端后由 /auth/me 校验恢复 */
  const persist = useCallback((state: AuthState | null) => {
    setAuth(state)
    if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    else localStorage.removeItem(STORAGE_KEY)
  }, [])

  const login = useCallback(
    async (playerName: string, password: string) => {
      const result = await api.login({ player_name: playerName, password: password })
      // 令牌不携带权限：is_admin 以 /auth/me 的当前账户为准（与中心契约一致）
      const account = await api.me()
      persist({
        account,
        token: result.access_token,
        expiresAt: result.expires_at,
      })
      return result
    },
    [persist],
  )

  const register = useCallback(
    async (playerName: string, password: string) => {
      const account = await api.register({ player_name: playerName, password: password })
      return account
    },
    [],
  )

  const logout = useCallback(() => {
    clearMockSession()
    persist(null)
  }, [persist])

  const value = useMemo(() => ({ auth, login, register, logout }), [auth, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}
