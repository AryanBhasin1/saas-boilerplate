import { OrganizationProfile } from '@clerk/nextjs'

export default function SettingsPage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'var(--font-body)' }}>
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 12, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          Organization
        </p>
        <h1 className="display" style={{ fontSize: 32, fontWeight: 400, color: 'var(--fg)', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
      </div>

      <OrganizationProfile
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
            navbar: 'hidden',
          },
        }}
      />
    </div>
  )
}
