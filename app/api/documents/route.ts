import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { processDocument } from '@/lib/embeddings'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function GET() {
  const session = await auth()
  if (!session.userId || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const org = await db.org.findUnique({ where: { clerkOrgId: session.orgId } })
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })
  const documents = await db.document.findMany({
    where: { orgId: org.id }, orderBy: { createdAt: 'desc' },
    include: { _count: { select: { chunks: true } } },
  })
  return NextResponse.json(documents)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session.userId || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const org = await db.org.findUnique({ where: { clerkOrgId: session.orgId } })
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })

  const doc = await db.document.create({ data: { orgId: org.id, name: file.name, size: file.size, status: 'PROCESSING' } })

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const chunks = await processDocument(buffer)
    for (const chunk of chunks) {
      const vectorLiteral = `[${chunk.embedding.join(',')}]`
      await db.$executeRaw`
        INSERT INTO "DocumentChunk" (id, "orgId", "documentId", content, embedding, "chunkIndex", "createdAt")
        VALUES (gen_random_uuid()::text, ${org.id}, ${doc.id}, ${chunk.content}, ${vectorLiteral}::vector, ${chunk.chunkIndex}, now())
      `
    }
    await db.document.update({ where: { id: doc.id }, data: { status: 'READY' } })
    return NextResponse.json({ ...doc, status: 'READY', chunks: chunks.length })
  } catch (err) {
    await db.document.update({ where: { id: doc.id }, data: { status: 'FAILED' } })
    console.error('Embedding failed:', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session.userId || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const org = await db.org.findUnique({ where: { clerkOrgId: session.orgId } })
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })
  const { id } = await req.json()
  const doc = await db.document.findFirst({ where: { id, orgId: org.id } })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await db.document.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
