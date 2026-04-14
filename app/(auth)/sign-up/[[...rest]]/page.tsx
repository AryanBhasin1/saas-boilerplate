// app/(auth)/sign-up/page.tsx
import { SignUp } from '@clerk/nextjs'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', padding: 24,
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
        <div style={{
          width: 32, height: 32, background: 'var(--amber)', borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={16} color="#0C0C0E" />
        </div>
        <span style={{ fontWeight: 600, fontSize: 17, color: 'var(--fg)', letterSpacing: '-0.02em' }}>
          SaasKit
        </span>
      </Link>

      <SignUp
        appearance={{
          variables: {
            colorBackground: '#141416',
            colorText: '#F0EDE8',
            colorInputBackground: '#1F1F24',
            colorInputText: '#F0EDE8',
            colorPrimary: '#F0A429',
            colorTextSecondary: '#7A7880',
            borderRadius: '10px',
            fontFamily: 'DM Sans, system-ui, sans-serif',
          },
          elements: {
            card: 'shadow-none',
            formButtonPrimary: 'font-semibold',
          },
        }}
      />
    </div>
  )
}
