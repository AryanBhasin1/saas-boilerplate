import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createPortalSession } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST() {
  const session = await auth()
  if (!session.userId || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const org = await db.org.findUnique({ where: { clerkOrgId: session.orgId } })
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })
  try {
    const portal = await createPortalSession(org.id)
    return NextResponse.json({ url: portal.url })
  } catch {
    return NextResponse.json({ error: 'No billing account found. Please subscribe first.' }, { status: 400 })
  }
}
