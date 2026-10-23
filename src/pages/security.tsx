import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { KeyRound, Loader2, LogIn, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Reveal } from '@/components/reveal'
import { api, ApiError } from '@/lib/api'
import { fmtDateTime } from '@/lib/format'
import { useAuth } from '@/hooks/auth'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { FieldLabel } from '@/ui/label'
import { useToast } from '@/ui/toast'

const changeSchema = z
  .object({
    old_password: z.string().min(1, '请输入旧密码'),
    new_password: z.string().regex(/^[A-Za-z0-9$%&@#^*!]{6,12}$/, '密码需为 6–12 位字母、数字或 $%&@#^*!'),
    confirm: z.string(),
  })
  .refine((values) => values.new_password === values.confirm, {
    message: '两次输入的新密码不一致',
    path: ['confirm'],
  })
type ChangeForm = z.infer<typeof changeSchema>

function ChangePasswordCard() {
  const { toast } = useToast()
  const form = useForm<ChangeForm>({
    resolver: zodResolver(changeSchema),
    defaultValues: { old_password: '', new_password: '', confirm: '' },
  })

  const mutation = useMutation({
    mutationFn: (values: ChangeForm) =>
      api.changePassword({ old_password: values.old_password, new_password: values.new_password }),
    onSuccess: () => {
      form.reset()
      toast('密码修改成功；所有已连接游戏服上的会话已被踢出')
    },
  })

  const apiErr = mutation.error instanceof ApiError ? mutation.error : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>修改密码</CardTitle>
        <Badge tone="neutral">与登录共享失败计数</Badge>
      </CardHeader>
      <CardContent className="pt-4">
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutateAsync(values).catch(() => {}))}
          className="max-w-[420px] space-y-3.5"
          noValidate
        >
          <div>
            <FieldLabel htmlFor="old-pass">旧密码</FieldLabel>
            <Input id="old-pass" type="password" autoComplete="current-password" {...form.register('old_password')} />
            {form.formState.errors.old_password && (
              <p className="mt-1.5 text-[12px] text-danger">{form.formState.errors.old_password.message}</p>
            )}
          </div>
          <div>
            <FieldLabel htmlFor="new-pass">新密码</FieldLabel>
            <Input id="new-pass" type="password" autoComplete="new-password" placeholder="6–12 位，大小写敏感" {...form.register('new_password')} />
            {form.formState.errors.new_password && (
              <p className="mt-1.5 text-[12px] text-danger">{form.formState.errors.new_password.message}</p>
            )}
          </div>
          <div>
            <FieldLabel htmlFor="confirm-pass">确认新密码</FieldLabel>
            <Input id="confirm-pass" type="password" autoComplete="new-password" {...form.register('confirm')} />
            {form.formState.errors.confirm && (
              <p className="mt-1.5 text-[12px] text-danger">{form.formState.errors.confirm.message}</p>
            )}
          </div>

          {apiErr && (
            <div className="flex items-start gap-2 rounded-[10px] border border-danger-line bg-danger-soft px-3.5 py-2.5 text-[12.5px] leading-relaxed text-danger-deep">
              <TriangleAlert size={14} className="mt-0.5 flex-none" />
              <span>
                {apiErr.reason === 'WRONG_PASSWORD'
                  ? `旧密码错误，还可尝试 ${apiErr.remainingAttempts ?? 0} 次`
                  : apiErr.reason === 'COOLING_DOWN'
                    ? '失败次数过多，已进入休息期；休息期内不允许改密'
                    : apiErr.message}
              </span>
            </div>
          )}

          <p className="text-[12px] leading-relaxed text-faint">
            旧密码错误与登录共享失败次数和休息期；修改成功后，所有已连接游戏服务器上的该账户将被踢出。
          </p>

          <Button type="submit" variant="primary" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            确认修改
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function SecurityPage() {
  const { auth } = useAuth()

  return (
    <div>
      <Reveal>
        <div className="mb-5">
          <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink">账户安全</h1>
          <p className="mt-1.5 text-[13.5px] text-mute">管理登录密码与 Web 会话；游戏内改密同样生效于所有服务器。</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Reveal delay={0.06}>
          <ChangePasswordCard />
        </Reveal>

        <div className="space-y-4">
          <Reveal delay={0.12}>
            <Card>
              <CardHeader>
                <CardTitle>当前会话</CardTitle>
                <Badge tone="emerald">有效</Badge>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-4 text-[12.5px]">
                <div className="flex items-center gap-2.5 text-mute">
                  <LogIn size={13} className="flex-none text-em" />
                  登录方式
                  <span className="ml-auto font-medium text-ink">Web 端 · JWT</span>
                </div>
                <div className="flex items-center gap-2.5 text-mute">
                  <ShieldCheck size={13} className="flex-none text-em" />
                  有效期至
                  <span className="ml-auto font-medium tabular-nums text-ink">{fmtDateTime(auth?.expiresAt ?? '')}</span>
                </div>
                <p className="border-t border-line pt-3 text-[12px] leading-relaxed text-faint">
                  会话有效期 2 小时，暂不支持自动续期；修改密码不会提前吊销当前令牌，如需立即失效请联系管理员变更签名密钥。
                </p>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.18}>
            <Card>
              <CardHeader>
                <CardTitle>账户删除</CardTitle>
                <Badge tone="amber">仅限管理员操作</Badge>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-4 text-[12.5px] leading-relaxed text-mute">
                <div className="flex items-start gap-2.5">
                  <KeyRound size={13} className="mt-0.5 flex-none text-warn" />
                  <span>首期账户删除仅允许中心管理员执行；Minecraft OP 不等同中心管理员。</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <KeyRound size={13} className="mt-0.5 flex-none text-warn" />
                  <span>账户删除后玩家名（忽略大小写）仍被永久占用，无法再次注册。</span>
                </div>
                <p className="border-t border-line pt-3 text-[12px] text-faint">如需删除账户，请联系服务器运营方。</p>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
