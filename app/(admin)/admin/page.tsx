import { requireSuperAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { UsageChart } from '@/components/usage-chart'
import { ShieldCheck, DollarSign, Zap, Building2 } from 'lucide-react'

const planRevenue: Record<string, number> = { FREE: 0, PRO: 49, ENTERPRISE: 299 }

export default async function AdminPage() {
  await requireSuperAdmin()

  const [orgs, totalUsage, allLogs] = await Promise.all([
    db.org.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { documents: true, messages: true } } },
    }),
    db.usageLog.aggregate({ _sum: { tokens: true } }),
    db.usageLog.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 14 * 86400000) } },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const mrr = orgs.reduce((sum, o) => sum + (planRevenue[o.plan] ?? 0), 0)
  const totalTokens = totalUsage._sum.tokens ?? 0

  const byDay: Record<string, number> = {}
  for (const log of allLogs) {
    const day = log.createdAt.toISOString().slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + log.tokens
  }
  const systemUsage = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const day = d.toISOString().slice(0, 10)
    return { date: day, tokens: byDay[day] ?? 0 }
  })

  const kpis = [
    { label: 'MRR',           value: `$${mrr.toLocaleString()}`, icon: DollarSign, color: 'var(--green)' },
    { label: 'Total Tokens',  value: totalTokens.toLocaleString(), icon: Zap,       color: 'var(--amber)' },
    { label: 'Organizations', value: orgs.length,                 icon: Building2,  color: 'var(--blue)' },
  ]

  return (
    <div style={{ padding: '40px', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
        <ShieldCheck size={18} color="var(--amber)" />
        <div>
          <h1 className="display" style={{ fontSize: 32, fontWeight: 400, color: 'var(--fg)', letterSpacing: '-0.02em' }}>
            Super Admin
          </h1>
          <p style={{ fontSize: 13, color: 'var(--fg-subtle)' }}>System-wide overview</p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ padding: '20px 24px' }}>
            <Icon size={16} color={color} style={{ marginBottom: 14 }} />
            <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.03em', marginBottom: 2 }}>{value}</p>
            <p style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 20 }}>
          System Token Usage <span style={{ color: 'var(--fg-subtle)', fontWeight: 400 }}>· 14 days</span>
        </p>
        <UsageChart data={systemUsage} />
      </div>

      {/* Orgs table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>All Organizations</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)' }}>
                {['Org ID', 'Plan', 'Tokens Used', 'Docs', 'Messages', 'Created'].map(h => (
                  <th key={h} style={{
                    padding: '10px 20px', textAlign: 'left', color: 'var(--fg-subtle)',
                    fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orgs.map((org, i) => (
                <tr key={org.id} style={{
                  borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                }}>
                  <td style={{ padding: '12px 20px', color: 'var(--fg-muted)', fontFamily: 'monospace', fontSize: 12 }}>
                    {org.clerkOrgId.slice(0, 24)}…
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500,
                      background: org.plan === 'ENTERPRISE' ? 'rgba(96,165,250,0.1)' : org.plan === 'PRO' ? 'var(--amber-glow)' : 'var(--bg-subtle)',
                      color: org.plan === 'ENTERPRISE' ? 'var(--blue)' : org.plan === 'PRO' ? 'var(--amber)' : 'var(--fg-subtle)',
                    }}>{org.plan}</span>
                  </td>
                  <td style={{ padding: '12px 20px', color: 'var(--fg-muted)' }}>{org.tokensUsed.toLocaleString()}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--fg-muted)' }}>{org._count.documents}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--fg-muted)' }}>{org._count.messages}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--fg-subtle)' }}>{org.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
