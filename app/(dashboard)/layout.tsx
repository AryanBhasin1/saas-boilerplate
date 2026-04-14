// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { OrganizationSwitcher, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import {
  LayoutDashboard, MessageSquare, FileText,
  CreditCard, Settings, ShieldCheck, Sparkles,
} from 'lucide-react'
import { db } from '@/lib/db'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat',      label: 'AI Chat',   icon: MessageSquare },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/billing',   label: 'Billing',   icon: CreditCard },
  { href: '/settings',  label: 'Settings',  icon: Settings },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session.userId) redirect('/sign-in')

  const superAdminIds = (process.env.SUPER_ADMIN_USER_IDS ?? '').split(',').filter(Boolean)
  const isSuperAdmin = superAdminIds.includes(session.userId)

  if (session.orgId) {
    await db.org.upsert({
      where: { clerkOrgId: session.orgId },
      update: {},
      create: { clerkOrgId: session.orgId, name: session.orgSlug ?? session.orgId },
    })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside style={{
        width: 232, flexShrink: 0,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Logo */}
        <div style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 26, height: 26, background: 'var(--amber)', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Sparkles size={13} color="#0C0C0E" />
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--fg)', letterSpacing: '-0.02em' }}>
            SaasKit
          </span>
        </div>

        {/* Org switcher */}
        <div style={{ padding: '12px 12px 8px' }}>
          <OrganizationSwitcher
            hidePersonal
            appearance={{
              elements: {
                organizationSwitcherTrigger: 'w-full text-sm',
                organizationSwitcherTriggerIcon: 'text-[--fg-muted]',
              },
            }}
          />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="nav-link">
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}

          {isSuperAdmin && (
            <>
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '8px 0' }} />
              <Link href="/admin" className="nav-link" style={{ color: 'var(--amber)' }}>
                <ShieldCheck size={16} />
                <span>Admin</span>
              </Link>
            </>
          )}
        </nav>

        {/* User */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <UserButton afterSignOutUrl="/sign-in" showName />
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

    </div>
  )
}
