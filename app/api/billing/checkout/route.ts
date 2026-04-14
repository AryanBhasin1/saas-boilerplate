import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session.userId || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { priceId } = await req.json()
  if (!priceId) return NextResponse.json({ error: 'priceId required' }, { status: 400 })
  const org = await db.org.findUnique({ where: { clerkOrgId: session.orgId } })
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress
  const checkout = await createCheckoutSession(org.id, priceId, email)
  return NextResponse.json({ url: checkout.url })
}
