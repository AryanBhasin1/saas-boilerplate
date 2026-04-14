// app/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Bot, Shield, Zap, Users, Sparkles } from 'lucide-react'

export default async function HomePage() {
  const session = await auth()
  if (session.userId) redirect('/dashboard')

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>

      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky', top: 0, backdropFilter: 'blur(12px)',
        background: 'rgba(12,12,14,0.8)', zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, background: 'var(--amber)', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={14} color="#0C0C0E" />
          </div>
          <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--fg)', letterSpacing: '-0.02em' }}>
            SaasKit
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/sign-in" style={{
            padding: '8px 16px', fontSize: 14, color: 'var(--fg-muted)',
            textDecoration: 'none', borderRadius: 'var(--radius)',
            transition: 'color 0.15s',
          }}>
            Sign in
          </Link>
          <Link href="/sign-up" className="btn-primary" style={{
            padding: '8px 18px', fontSize: 14, display: 'flex',
            alignItems: 'center', gap: 6, textDecoration: 'none',
          }}>
            Get started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 780, margin: '0 auto', padding: '100px 32px 80px',
        textAlign: 'center',
      }}>
        {/* Badge */}
        <div className="amber-badge animate-fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
          <Zap size={11} />
          Groq · Llama 3.3 70B · pgvector RAG
        </div>

        {/* Headline */}
        <h1 className="display animate-fade-up" style={{
          fontSize: 'clamp(44px, 7vw, 72px)',
          lineHeight: 1.08,
          fontWeight: 400,
          color: 'var(--fg)',
          marginBottom: 24,
          letterSpacing: '-0.02em',
        }}>
          Multi-tenant SaaS<br />
          <span style={{ color: 'var(--fg-muted)', fontStyle: 'italic' }}>with AI built in</span>
        </h1>

        <p className="animate-fade-up stagger-1" style={{
          fontSize: 18, color: 'var(--fg-muted)', lineHeight: 1.7,
          maxWidth: 560, margin: '0 auto 44px', fontWeight: 300,
        }}>
          Production-grade boilerplate with per-org AI chat, RAG over uploaded documents,
          Stripe billing, and complete data isolation.
        </p>

        <div className="animate-fade-up stagger-2" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/sign-up" className="btn-primary" style={{
            padding: '12px 24px', fontSize: 15, display: 'flex',
            alignItems: 'center', gap: 8, textDecoration: 'none', borderRadius: 'var(--radius)',
          }}>
            Start for free <ArrowRight size={16} />
          </Link>
          <Link href="/sign-in" className="btn-ghost" style={{
            padding: '12px 24px', fontSize: 15,
            textDecoration: 'none', display: 'inline-flex',
          }}>
            Sign in
          </Link>
        </div>
      </section>

      {/* ── Features grid ──────────────────────────────────────── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px 120px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[
            {
              icon: Shield, title: 'Tenant Isolation',
              desc: 'orgId on every DB row. Every query is scoped — no data ever crosses org boundaries.',
              delay: 'stagger-1',
            },
            {
              icon: Bot, title: 'RAG Pipeline',
              desc: 'Upload PDFs → auto-embed with pgvector → AI answers grounded in your documents.',
              delay: 'stagger-2',
            },
            {
              icon: Zap, title: 'Groq Streaming',
              desc: 'Llama 3.3 70B via Groq for near-instant responses. Swap models in one line.',
              delay: 'stagger-3',
            },
            {
              icon: Users, title: 'Clerk Orgs',
              desc: 'Teams, member invites, role management — zero auth code to write yourself.',
              delay: 'stagger-4',
            },
          ].map(({ icon: Icon, title, desc, delay }) => (
            <div key={title} className={`card card-hover animate-fade-up ${delay}`} style={{ padding: 28 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--amber-glow)', border: '1px solid rgba(240,164,41,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <Icon size={18} color="var(--amber)" />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)', marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{
        textAlign: 'center', padding: '24px 32px',
        borderTop: '1px solid var(--border-subtle)',
        color: 'var(--fg-subtle)', fontSize: 13,
      }}>
        Next.js 15 · Clerk · Prisma · Groq · Stripe
      </footer>

    </main>
  )
}
