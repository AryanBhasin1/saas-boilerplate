'use client'
// components/billing-client.tsx
import { useState } from 'react'
import { Check, Loader2, ExternalLink, Zap } from 'lucide-react'

const plans = [
  {
    id: 'FREE', name: 'Free', price: '$0', period: '',
    tokens: '50k tokens / mo',
    features: ['50,000 tokens / month', 'Up to 5 documents', '1 organization', 'Community support'],
    priceId: null, highlight: false,
  },
  {
    id: 'PRO', name: 'Pro', price: '$49', period: '/mo',
    tokens: '500k tokens / mo',
    features: ['500,000 tokens / month', 'Unlimited documents', 'Priority support', 'Usage analytics'],
    priceId: 'PRO', highlight: true,
  },
  {
    id: 'ENTERPRISE', name: 'Enterprise', price: '$299', period: '/mo',
    tokens: '5M tokens / mo',
    features: ['5,000,000 tokens / month', 'Unlimited everything', 'Dedicated support', 'Custom models', 'SLA guarantee'],
    priceId: 'ENTERPRISE', highlight: false,
  },
]

interface Props {
  currentPlan: string
  tokensUsed: number; tokensLimit: number; usagePct: number
  proPriceId: string; enterprisePriceId: string
  hasStripeCustomer: boolean
}

export function BillingClient({ currentPlan, tokensUsed, tokensLimit, usagePct, proPriceId, enterprisePriceId, hasStripeCustomer }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const priceIds: Record<string, string> = { PRO: proPriceId, ENTERPRISE: enterprisePriceId }

  const subscribe = async (planId: string) => {
    const pid = priceIds[planId]; if (!pid) return
    setLoading(planId)
    try {
      const res = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ priceId: pid }) })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally { setLoading(null) }
  }

  const openPortal = async () => {
    setLoading('portal')
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const { url, error } = await res.json()
      if (error) { alert(error); return }
      if (url) window.location.href = url
    } finally { setLoading(null) }
  }

  return (
    <div style={{ maxWidth: 900 }}>

      {/* Current usage card */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Zap size={14} color="var(--amber)" />
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>Current Usage</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>
              Plan: <span style={{ color: 'var(--fg-muted)' }}>{currentPlan}</span>
            </p>
          </div>
          {hasStripeCustomer && (
            <button onClick={openPortal} disabled={loading === 'portal'} className="btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>
              {loading === 'portal' ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <ExternalLink size={13} />}
              Manage subscription
            </button>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--fg-muted)', marginBottom: 10 }}>
          <span>{tokensUsed.toLocaleString()} used</span>
          <span style={{ color: 'var(--fg-subtle)' }}>{tokensLimit.toLocaleString()} limit</span>
        </div>
        <div style={{ height: 5, background: 'var(--bg-subtle)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${Math.min(usagePct, 100)}%`,
            background: usagePct > 80
              ? 'linear-gradient(90deg, var(--red), #FF4444)'
              : 'linear-gradient(90deg, var(--amber-dim), var(--amber))',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--fg-subtle)', marginTop: 8 }}>{usagePct}% used · resets monthly</p>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {plans.map(plan => {
          const isCurrent = plan.id === currentPlan
          const isLoading = loading === plan.id

          return (
            <div key={plan.id} style={{
              background: plan.highlight ? 'var(--bg-card)' : 'var(--bg-card)',
              border: `1px solid ${isCurrent ? 'var(--amber-dim)' : plan.highlight ? 'var(--border)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              position: 'relative',
              transition: 'border-color 0.2s',
            }}>
              {plan.highlight && (
                <div style={{
                  position: 'absolute', top: -1, left: 20, right: 20,
                  height: 2, background: 'linear-gradient(90deg, var(--amber-dim), var(--amber))',
                  borderRadius: '0 0 4px 4px',
                }} />
              )}

              {isCurrent && (
                <div className="amber-badge" style={{ display: 'inline-block', marginBottom: 12 }}>
                  Current plan
                </div>
              )}
              {plan.highlight && !isCurrent && (
                <div className="amber-badge" style={{ display: 'inline-block', marginBottom: 12 }}>
                  Most popular
                </div>
              )}

              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg)', marginBottom: 4 }}>{plan.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.03em' }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: 'var(--fg-subtle)' }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--fg-subtle)', marginBottom: 20 }}>{plan.tokens}</p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fg-muted)' }}>
                    <Check size={13} color="var(--green)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => plan.priceId && subscribe(plan.id)}
                disabled={isCurrent || !plan.priceId || !!isLoading}
                style={{
                  width: '100%', padding: '10px', borderRadius: 'var(--radius)',
                  border: 'none', cursor: isCurrent || !plan.priceId ? 'default' : 'pointer',
                  fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: isCurrent || !plan.priceId ? 'var(--bg-subtle)' : 'var(--amber)',
                  color: isCurrent || !plan.priceId ? 'var(--fg-subtle)' : '#0C0C0E',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'opacity 0.15s, transform 0.15s',
                }}
              >
                {isLoading && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                {isCurrent ? 'Current plan' : plan.priceId ? 'Upgrade' : 'Free'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
