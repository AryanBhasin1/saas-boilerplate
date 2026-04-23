import { NextRequest, NextResponse } from 'next/server'
import { planFromPriceId } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

export const runtime = 'nodejs'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  })
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orgId = session.metadata?.orgId
      if (!orgId || !session.subscription) break
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const priceId = subscription.items.data[0]?.price.id
      await db.org.update({ where: { id: orgId }, data: { stripeCustomerId: session.customer as string, stripePriceId: priceId, plan: planFromPriceId(priceId) } })
      break
    }
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const org = await db.org.findFirst({ where: { stripeCustomerId: invoice.customer as string } })
      if (org) await db.org.update({ where: { id: org.id }, data: { tokensUsed: 0 } })
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const org = await db.org.findFirst({ where: { stripeCustomerId: sub.customer as string } })
      if (org) await db.org.update({ where: { id: org.id }, data: { plan: 'FREE', stripePriceId: null } })
      break
    }
  }
  return NextResponse.json({ received: true })
}