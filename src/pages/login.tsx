import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Info, Loader2, Lock, TimerReset, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { ApiError } from '@/lib/api'
import { useAuth } from '@/hooks/auth'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { FieldLabel } from '@/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'

const loginSchema = z.object({
  player_name: z.string().regex(/^[A-Za-z0-9_]{3,16}$/, '玩家名需为 3–16 位字母、数字或下划线'),
  password: z.string().min(1, '请输入密码'),
})
type LoginForm = z.infer<typeof loginSchema>

/** 服务端错误横幅：区分密码错误（剩余次数）与休息期（倒计时） */
function ErrorBanner({ error }: { error: unknown }) {
  const apiErr = error instanceof ApiError ? error : null
  if (!apiErr) return null

  if (apiErr.reason === 'COOLING_DOWN') {
    return <CooldownBanner seconds={apiErr.retryAfterSeconds ?? 0} />
  }
  const remaining = apiErr.remainingAttempts
  return (
    <div className="flex items-start gap-2 rounded-[10px] border border-danger-line bg-danger-soft px-3.5 py-2.5 text-[12.5px] leading-relaxed text-danger-deep">
      <Info size={14} className="mt-0.5 flex-none" />
      <span>
        {apiErr.message}
        {remaining !== undefined && `，还可尝试 ${remaining} 次`}
      </span>
    </div>
  )
}

function CooldownBanner({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    const timer = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000)
    return () => clearInterval(timer)
  }, [])
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  return (
    <div className="flex items-start gap-2 rounded-[10px] border border-warn-line bg-warn-soft px-3.5 py-2.5 text-[12.5px] leading-relaxed text-warn-deep">
      <TimerReset size={14} className="mt-0.5 flex-none" />
      <span>
        登录尝试过多，已进入休息期；剩余 <b className="font-mono tabular-nums">{mm}:{ss}</b>。
        休息期内即使密码正确也无法登录，到期后自动从零重新计数。
      </span>
    </div>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { player_name: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: (values: LoginForm) => login(values.player_name, values.password),
    onSuccess: () => {
      const from = (location.state as { from?: string } | null)?.from
      navigate(from && from !== '/login' ? from : '/', { replace: true })
    },
  })

  return (
    <div className="w-full">
      <Tabs defaultValue="login">
        <TabsList className="mb-6">
          <TabsTrigger value="login">登 录</TabsTrigger>
          <TabsTrigger value="register" asChild>
            <Link to="/register">注册新账户</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink">欢迎回来 👋</h1>
          <p className="mb-6 mt-2 text-[13.5px] leading-relaxed text-mute">
            登录你的 RealmMesh 中心账户，管理跨服资产。
          </p>

          <form onSubmit={form.handleSubmit((values) => mutation.mutateAsync(values).catch(() => {}))} className="space-y-3.5" noValidate>
            <div>
              <FieldLabel htmlFor="login-name">玩家名</FieldLabel>
              <div className="relative">
                <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
                <Input
                  id="login-name"
                  autoComplete="username"
                  placeholder="3–16 位字母、数字或下划线"
                  className="pl-10"
                  {...form.register('player_name')}
                />
              </div>
              {form.formState.errors.player_name && (
                <p className="mt-1.5 text-[12px] text-danger">{form.formState.errors.player_name.message}</p>
              )}
            </div>

            <div>
              <FieldLabel htmlFor="login-pass">密码</FieldLabel>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
                <Input
                  id="login-pass"
                  type="password"
                  autoComplete="current-password"
                  placeholder="6–12 位，大小写敏感"
                  className="pl-10"
                  {...form.register('password')}
                />
              </div>
              {form.formState.errors.password && (
                <p className="mt-1.5 text-[12px] text-danger">{form.formState.errors.password.message}</p>
              )}
            </div>

            <ErrorBanner error={mutation.error} />

            <div className="flex items-start gap-2 rounded-[10px] border-l-2 border-line-2 px-3 py-2 text-[12px] leading-relaxed text-faint">
              <Info size={13} className="mt-0.5 flex-none" />
              <span>
                连续 3 次密码错误将进入 5 分钟休息期，且跨服务器共享计数；成功登录自动清零。
              </span>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : null}
              登录
              {!mutation.isPending && <ArrowRight size={15} />}
            </Button>
          </form>

          <div className="mt-5 rounded-[10px] bg-ink/[0.035] px-3.5 py-3 text-[11.5px] leading-relaxed text-faint">
            演示环境：任意格式正确的账号密码均可登录普通账户；管理员演示账号{' '}
            <b className="font-mono text-mute">admin / admin123</b>
            ；密码含 <b className="font-mono text-mute">fail</b> 时模拟密码错误，连续 3 次触发休息期。
          </div>

          <p className="mt-5 text-center text-[12px] text-faint">
            还没有账户？<Link to="/register" className="font-semibold text-em-deep hover:underline">注册新账户</Link>
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
