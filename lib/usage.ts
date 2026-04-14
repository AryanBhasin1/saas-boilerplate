import { db } from './db'
import { PLAN_LIMITS } from './groq'

export async function checkUsageLimit(orgId: string) {
  const org = await db.org.findUnique({ where: { id: orgId } })
  if (!org) throw new Error('Org not found')
  const limit = PLAN_LIMITS[org.plan] ?? PLAN_LIMITS.FREE
  return { allowed: org.tokensUsed < limit, used: org.tokensUsed, limit, plan: org.plan }
}

export async function recordUsage(orgId: string, tokens: number, model: string) {
  await Promise.all([
    db.usageLog.create({ data: { orgId, tokens, model } }),
    db.org.update({ where: { id: orgId }, data: { tokensUsed: { increment: tokens } } }),
  ])
}

export async function getDailyUsage(orgId: string, days = 14) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const logs = await db.usageLog.findMany({
    where: { orgId, createdAt: { gte: since } },
    orderBy: { createdAt: 'asc' },
  })
  const byDay: Record<string, number> = {}
  for (const log of logs) {
    const day = log.createdAt.toISOString().slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + log.tokens
  }
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const day = d.toISOString().slice(0, 10)
    return { date: day, tokens: byDay[day] ?? 0 }
  })
}
