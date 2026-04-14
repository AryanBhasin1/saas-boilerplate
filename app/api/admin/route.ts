import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  await requireSuperAdmin()
  const [orgs, totalUsage] = await Promise.all([
    db.org.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { documents: true, messages: true } } } }),
    db.usageLog.aggregate({ _sum: { tokens: true } }),
  ])
  const planRevenue: Record<string, number> = { FREE: 0, PRO: 49, ENTERPRISE: 299 }
  const mrr = orgs.reduce((sum, org) => sum + (planRevenue[org.plan] ?? 0), 0)
  return NextResponse.json({ orgs, mrr, totalTokens: totalUsage._sum.tokens ?? 0 })
}
