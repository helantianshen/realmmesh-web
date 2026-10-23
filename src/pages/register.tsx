import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Info, Loader2, Lock, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/hooks/auth'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { FieldLabel } from '@/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'

/** 与中心注册规则一致：名字 3–16 位 ASCII；密码 6–12 位字母、数字或 $%&@#^*! */
const registerSchema = z
  .object({
    player_name: z.string().regex(/^[A-Za-z0-9_]{3,16}$/, '玩家名需为 3–16 位字母、数字或下划线'),
    password: z.string().regex(/^[A-Za-z0-9$%&@#^*!]{6,12}$/, '密码需为 6–12 位字母、数字或 $%&@#^*!'),
    confirm: z.string(),
  })
  .refine((values) => values.password === values.confirm, {
    message: '两次输入的密码不一致',
    path: ['confirm'],
  })
type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { player_name: '', password: '', confirm: '' },
  })

  const mutation = useMutation({
    mutationFn: async (values: RegisterForm) => {
      await api.register({ player_name: values.player_name, password: values.password })
      // 与中心行为一致：注册成功自动登录（登录可能触发休息期等业务错误，原样抛出）
      await login(values.player_name, values.password)
    },
    onSuccess: () => navigate('/', { replace: true }),
  })

  const apiErr = mutation.error instanceof ApiError ? mutation.error : null

  return (
    <div className="w-full">
      <Tabs defaultValue="register">
        <TabsList className="mb-6">
          <TabsTrigger value="login" asChild>
            <Link to="/login">登 录</Link>
          </TabsTrigger>
          <TabsTrigger value="register">注册新账户</TabsTrigger>
        </TabsList>
        <TabsContent value="register">
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink">创建中心账户</h1>
          <p className="mb-6 mt-2 text-[13.5px] leading-relaxed text-mute">
            玩家名全局唯一、忽略大小写；注册成功后自动登录。
          </p>

          <form onSubmit={form.handleSubmit((values) => mutation.mutateAsync(values).catch(() => {}))} className="space-y-3.5" noValidate>
            <div>
              <FieldLabel htmlFor="reg-name">玩家名</FieldLabel>
              <div className="relative">
                <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
                <Input
                  id="reg-name"
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
              <FieldLabel htmlFor="reg-pass">设置密码</FieldLabel>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
                <Input
                  id="reg-pass"
                  type="password"
                  autoComplete="new-password"
                  placeholder="6–12 位，大小写敏感"
                  className="pl-10"
                  {...form.register('password')}
                />
              </div>
              {form.formState.errors.password && (
                <p className="mt-1.5 text-[12px] text-danger">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <FieldLabel htmlFor="reg-confirm">确认密码</FieldLabel>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
                <Input
                  id="reg-confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="再次输入密码"
                  className="pl-10"
                  {...form.register('confirm')}
                />
              </div>
              {form.formState.errors.confirm && (
                <p className="mt-1.5 text-[12px] text-danger">{form.formState.errors.confirm.message}</p>
              )}
            </div>

            {apiErr && (
              <div className="flex items-start gap-2 rounded-[10px] border border-danger-line bg-danger-soft px-3.5 py-2.5 text-[12.5px] leading-relaxed text-danger-deep">
                <Info size={14} className="mt-0.5 flex-none" />
                <span>
                  {apiErr.reason === 'PLAYER_NAME_TAKEN'
                    ? '玩家名已被占用（忽略大小写，含已删除账户）'
                    : apiErr.reason === 'COOLING_DOWN'
                      ? '该玩家名正处于休息期，请稍后再试'
                      : apiErr.message}
                </span>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : null}
              注册并进入
              {!mutation.isPending && <ArrowRight size={15} />}
            </Button>
          </form>

          <p className="mt-5 text-center text-[12px] text-faint">
            已有账户？<Link to="/login" className="font-semibold text-em-deep hover:underline">直接登录</Link>
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
