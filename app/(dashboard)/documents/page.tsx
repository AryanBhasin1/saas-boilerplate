import { getOrgContext } from '@/lib/auth'
import { db } from '@/lib/db'
import { DocumentManager } from '@/components/document-manager'

export default async function DocumentsPage() {
  const { org } = await getOrgContext()

  const raw = await db.document.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { chunks: true } } },
  })

  const documents = raw.map(d => ({ ...d, createdAt: d.createdAt.toISOString() }))

  return (
    <div style={{ padding: '40px', fontFamily: 'var(--font-body)' }}>
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 12, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          Knowledge base
        </p>
        <h1 className="display" style={{ fontSize: 32, fontWeight: 400, color: 'var(--fg)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Documents
        </h1>
        <p style={{ fontSize: 14, color: 'var(--fg-muted)' }}>
          Upload PDFs to give the AI context about your organization.
        </p>
      </div>

      <DocumentManager initialDocuments={documents} />
    </div>
  )
}