import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'

/** 路由切换后回到顶部：滚动位置行为可预期，避免切页残留滚动造成的跳动 */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

import { AdminLayout } from '@/components/admin-layout'
import { AppShell } from '@/components/app-shell'
import { AuthLayout } from '@/components/auth-layout'
import { AuthProvider, useAuth } from '@/hooks/auth'
import { TooltipProvider } from '@/ui/tooltip'
import { ToastProvider } from '@/ui/toast'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { OverviewPage } from '@/pages/overview'
import { WarehousePage } from '@/pages/warehouse'
import { ActivityPage } from '@/pages/activity'
import { ServersPage } from '@/pages/servers'
import { SecurityPage } from '@/pages/security'
import { NotFoundPage } from '@/pages/not-found'
import { AdminDashboardPage } from '@/pages/admin/dashboard'
import { AdminServersPage } from '@/pages/admin/servers'
import { AdminAccountsPage } from '@/pages/admin/accounts'
import { AdminConfigPage } from '@/pages/admin/config'
import { AdminAuditPage } from '@/pages/admin/audit'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
})

function RequireAuth() {
  const { auth } = useAuth()
  const location = useLocation()
  if (!auth) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

function RequireAdmin() {
  const { auth } = useAuth()
  if (!auth?.account.is_admin) return <Navigate to="/" replace />
  return <Outlet />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <TooltipProvider delayDuration={300}>
            <AuthProvider>
            <BrowserRouter>
              <ScrollToTop />
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              <Route element={<RequireAuth />}>
                <Route element={<AppShell />}>
                  <Route path="/" element={<OverviewPage />} />
                  <Route path="/warehouse" element={<WarehousePage />} />
                  <Route path="/activity" element={<ActivityPage />} />
                  <Route path="/servers" element={<ServersPage />} />
                  <Route path="/security" element={<SecurityPage />} />
                </Route>

                <Route element={<RequireAdmin />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/admin/servers" element={<AdminServersPage />} />
                    <Route path="/admin/accounts" element={<AdminAccountsPage />} />
                    <Route path="/admin/config" element={<AdminConfigPage />} />
                    <Route path="/admin/audit" element={<AdminAuditPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </ToastProvider>
      </MotionConfig>
    </QueryClientProvider>
  )
}
