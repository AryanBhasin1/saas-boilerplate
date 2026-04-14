import type { Pipeline } from '@xenova/transformers'

let pipeline: Pipeline | null = null

async function getEmbeddingPipeline(): Promise<Pipeline> {
  if (pipeline) return pipeline
  const { pipeline: createPipeline, env } = await import('@xenova/transformers')
  env.cacheDir = '/tmp/xenova-cache'
  pipeline = await createPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  return pipeline
}

export async function embedText(text: string): Promise<number[]> {
  const pipe = await getEmbeddingPipeline()
  const output = await pipe(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}

export function chunkText(text: string, chunkSize = 2000, overlap = 200): string[] {
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end).trim())
    if (end === text.length) break
    start = end - overlap
  }
  return chunks.filter(c => c.length > 50)
}

export async function processDocument(buffer: Buffer) {
  const pdfParse = (await import('pdf-parse')).default
  const parsed = await pdfParse(buffer)
  const chunks = chunkText(parsed.text)
  return Promise.all(
    chunks.map(async (content, chunkIndex) => ({
      content,
      embedding: await embedText(content),
      chunkIndex,
    }))
  )
}
