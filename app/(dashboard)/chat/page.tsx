import { getOrgContext } from '@/lib/auth'
import { db } from '@/lib/db'
import { ChatInterface } from '@/components/chat'

export default async function ChatPage() {
  const { org, userId } = await getOrgContext()

  const history = await db.message.findMany({
    where: { orgId: org.id, userId },
    orderBy: { createdAt: 'asc' },
    take: 50,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{
        padding: '20px 28px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        flexShrink: 0,
      }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>AI Chat</h1>
        <p style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>
          Groq · Llama 3.3 70B · RAG over your documents
        </p>
      </div>

      <ChatInterface
        initialMessages={history.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))}
      />
    </div>
  )
}
