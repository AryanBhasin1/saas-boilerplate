import Groq from 'groq-sdk'
import { createGroq } from '@ai-sdk/groq'

export const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY! })
export const groq = createGroq({ apiKey: process.env.GROQ_API_KEY! })
export const CHAT_MODEL = 'llama-3.3-70b-versatile'

export const PLAN_LIMITS = {
  FREE:       50_000,
  PRO:       500_000,
  ENTERPRISE: 5_000_000,
} as const

export const STRIPE_PRICES = {
  PRO:        process.env.STRIPE_PRICE_PRO ?? '',
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE ?? '',
} as const
