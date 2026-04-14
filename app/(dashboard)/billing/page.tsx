import { getOrgContext } from '@/lib/auth'
import { PLAN_LIMITS, STRIPE_PRICES } from '@/lib/groq'
import { BillingClient } from '@/components/billing-client'

export default async function BillingPage() {
  const { org } = await getOrgContext()

  const limit = PLAN_LIMITS[org.plan]
  const usagePct = Math.round((org.tokensUsed / limit) * 100)

  return (
    <div style={{ padding: '40px', fontFamily: 'var(--font-body)' }}>
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 12, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          Subscription
        </p>
        <h1 className="display" style={{ fontSize: 32, fontWeight: 400, color: 'var(--fg)', letterSpacing: '-0.02em' }}>
          Billing
        </h1>
      </div>

      <BillingClient
        currentPlan={org.plan}
        tokensUsed={org.tokensUsed}
        tokensLimit={limit}
        usagePct={usagePct}
        proPriceId={STRIPE_PRICES.PRO}
        enterprisePriceId={STRIPE_PRICES.ENTERPRISE}
        hasStripeCustomer={!!org.stripeCustomerId}
      />
    </div>
  )
}
