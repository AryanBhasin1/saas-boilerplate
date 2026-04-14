import { streamText } from 'ai'
import { auth } from '@clerk/nextjs/server'
import { groq, CHAT_MODEL } from '@/lib/groq'
import { retrieveContext, buildSystemPrompt } from '@/lib/rag'
import { checkUsageLimit, recordUsage } from '@/lib/usage'
import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session.userId || !session.orgId) return new Response('Unauthorized', { status: 401 })

  const { messages } = await req.json()
  const org = await db.org.findUnique({ where: { clerkOrgId: session.orgId } })
  if (!org) return new Response('Org not found', { status: 404 })

  const usage = await checkUsageLimit(org.id)
  if (!usage.allowed) {
    return new Response(
      JSON.stringify({ error: 'Token limit reached. Please upgrade your plan.', code: 'LIMIT_REACHED' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
  const chunks = lastUserMessage ? await retrieveContext(lastUserMessage.content, org.id) : []
  const systemPrompt = buildSystemPrompt(chunks)

  if (lastUserMessage) {
    await db.message.create({
      data: { orgId: org.id, userId: session.userId, role: 'user', content: lastUserMessage.content },
    })
  }

  const result = streamText({
    model: groq(CHAT_MODEL),
    system: systemPrompt,
    messages,
    onFinish: async ({ text, usage: tokenUsage }) => {
      await db.message.create({
        data: { orgId: org.id, userId: session.userId, role: 'assistant', content: text, tokens: tokenUsage?.completionTokens ?? 0 },
      })
      const total = (tokenUsage?.promptTokens ?? 0) + (tokenUsage?.completionTokens ?? 0)
      await recordUsage(org.id, total, CHAT_MODEL)
    },
  })

  return result.toDataStreamResponse()
}
