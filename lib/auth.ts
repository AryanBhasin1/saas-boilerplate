import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from './db'

export async function getOrgContext() {
  const session = await auth()
  if (!session.userId) redirect('/sign-in')
  if (!session.orgId) redirect('/select-org')

  const org = await db.org.upsert({
    where: { clerkOrgId: session.orgId },
    update: {},
    create: { clerkOrgId: session.orgId, name: session.orgSlug ?? session.orgId },
  })

  return { userId: session.userId, clerkOrgId: session.orgId, org }
}

export async function requireSuperAdmin() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')
  const superAdminIds = (process.env.SUPER_ADMIN_USER_IDS ?? '').split(',')
  if (!superAdminIds.includes(user.id)) redirect('/dashboard')
  return user
}
