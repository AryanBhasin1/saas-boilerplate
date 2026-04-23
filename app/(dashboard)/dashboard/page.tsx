// app/(dashboard)/dashboard/page.tsx
import { getOrgContext } from '@/lib/auth'
import { getDailyUsage } from '@/lib/usage'
import { db } from '@/lib/db'
import { PLAN_LIMITS } from '@/lib/groq'
import { UsageChart } from '@/components/usage-chart'
import { FileText, MessageSquare, Zap, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const { org } = await getOrgContext()

  const [documents, messages, dailyUsage] = await Promise.all([
    db.document.count({ where: { orgId: org.id } }),
    db.message.count({ where: { orgId: org.id } }),
    getDailyUsage(org.id),
  ])

  const limit = PLAN_LIMITS[org.plan]
  const usagePct = Math.round((org.tokensUsed / limit) * 100)

  const stats = [
    { label: 'Documents',   value: documents,                      icon: FileText,     color: 'var(--amber)' },
    { label: 'Messages',    value: messages,                       icon: MessageSquare,color: 'var(--blue)' },
    { label: 'Tokens Used', value: org.tokensUsed.toLocaleString(),icon: Zap,          color: 'var(--green)' },
    { label: 'Plan',        value: org.plan,                       icon: TrendingUp,   color: 'var(--fg-muted)' },
  ]

  return (
    <div style={{ padding: '40px 40px', maxWidth: 1000 }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 12, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          Overview
        </p>
        <h1 className="display" style={{ fontSize: 32, fontWeight: 400, color: 'var(--fg)', letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
      </div>

      {/* Stats */}
      <div className="animate-fade-up stagger-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ padding: '20px 22px' }}>
            <Icon size={16} color={color} style={{ marginBottom: 14, opacity: 0.9 }} />
            <p style={{ fontSize: 24, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-0.02em', marginBottom: 2 }}>
              {value}
            </p>
            <p style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Token usage bar */}
      <div className="card animate-fade-up stagger-2" style={{ padding: '24px 28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 2 }}>Token Usage</p>
            <p style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>{org.plan} plan · resets monthly</p>
          </div>
          <p style={{ fontSize: 13, color: 'var(--fg-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {org.tokensUsed.toLocaleString()} <span style={{ color: 'var(--fg-subtle)' }}>/ {limit.toLocaleString()}</span>
          </p>
        </div>

        {/* Track */}
        <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${Math.min(usagePct, 100)}%`,
            background: usagePct > 80
              ? 'linear-gradient(90deg, var(--red), #FF4444)'
              : usagePct > 60
              ? 'linear-gradient(90deg, var(--amber-dim), var(--amber))'
              : 'linear-gradient(90deg, var(--amber-dim), var(--amber))',
            transition: 'width 0.6s ease',
          }} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--fg-subtle)', marginTop: 8 }}>{usagePct}% used</p>
      </div>

      {/* Chart */}
      <div className="card animate-fade-up stagger-3" style={{ padding: '24px 28px' }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)', marginBottom: 20 }}>
          Daily Token Usage <span style={{ color: 'var(--fg-subtle)', fontWeight: 400 }}>· 14 days</span>
        </p>
        <UsageChart data={dailyUsage} />
      </div>

    </div>
  )
}
