import { db } from './db'
import { embedText } from './embeddings'

export interface RagChunk { content: string; documentId: string; similarity: number }

export async function retrieveContext(query: string, orgId: string): Promise<RagChunk[]> {
  const queryEmbedding = await embedText(query)
  const vectorLiteral = `[${queryEmbedding.join(',')}]`

  const results = await db.$queryRaw<Array<{ id: string; content: string; documentId: string; similarity: number }>>`
    SELECT id, content, "documentId",
           1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
    FROM "DocumentChunk"
    WHERE "orgId" = ${orgId} AND embedding IS NOT NULL
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT 5
  `
  return results.filter(r => r.similarity > 0.3).map(r => ({
    content: r.content, documentId: r.documentId, similarity: r.similarity,
  }))
}

export function buildSystemPrompt(chunks: RagChunk[]): string {
  const base = `You are a helpful AI assistant. Answer questions accurately and concisely.`
  if (chunks.length === 0) return base
  const context = chunks.map((c, i) => `[${i + 1}] ${c.content}`).join('\n\n')
  return `${base}\n\nUse the following context from uploaded documents to answer the user's question. If the answer isn't in the context, say so honestly.\n\nCONTEXT:\n${context}`
}
