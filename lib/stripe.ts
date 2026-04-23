import Stripe from 'stripe'
import { db } from './db'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function getOrCreateStripeCustomer(orgId: string, email?: string) {
  const org = await db.org.findUnique({ where: { id: orgId } })
  if (!org) throw new Error('Org not found')
  if (org.stripeCustomerId) {
    return stripe.customers.retrieve(org.stripeCustomerId) as Promise<Stripe.Customer>
  }
  const customer = await stripe.customers.create({
    email, metadata: { orgId, clerkOrgId: org.clerkOrgId },
  })
  await db.org.update({ where: { id: orgId }, data: { stripeCustomerId: customer.id } })
  return customer
}

export async function createCheckoutSession(orgId: string, priceId: string, userEmail?: string) {
  const customer = await getOrCreateStripeCustomer(orgId, userEmail)
  return stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=1`,
    metadata: { orgId },
  })
}

export async function createPortalSession(orgId: string) {
  const org = await db.org.findUnique({ where: { id: orgId } })
  if (!org?.stripeCustomerId) throw new Error('No Stripe customer found')
  return stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  })
}

export function planFromPriceId(priceId: string): 'PRO' | 'ENTERPRISE' | 'FREE' {
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'PRO'
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) return 'ENTERPRISE'
  return 'FREE'
}