/** 数字与时间展示工具：全部为纯函数，供页面直接调用 */

export function fmtNum(value: number) {
  return value.toLocaleString('zh-CN')
}

export function fmtDateTime(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fmtDate(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 相对时间：刚刚 / N 分钟前 / 今天 HH:mm / 昨天 HH:mm / MM-DD HH:mm */
export function relTime(iso: string, now = new Date()) {
  const t = new Date(iso).getTime()
  const diff = Math.max(0, now.getTime() - t)
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (t >= today) return `今天 ${hm}`
  if (t >= today - 86_400_000) return `昨天 ${hm}`
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${hm}`
}

export function greeting(now = new Date()) {
  const h = now.getHours()
  if (h < 5) return '夜深了'
  if (h < 11) return '早上好'
  if (h < 13) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}
