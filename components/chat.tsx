'use client'
// components/chat.tsx
import { useChat, Message } from '@ai-sdk/react'
import { Send, Bot, User, AlertCircle } from 'lucide-react'
import { useRef, useEffect } from 'react'

interface ChatInterfaceProps {
  initialMessages?: Message[]
}

export function ChatInterface({ initialMessages = [] }: ChatInterfaceProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    initialMessages,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 0' }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', textAlign: 'center', padding: 40,
          }}>
            <div style={{
              width: 56, height: 56,
              background: 'var(--amber-glow)',
              border: '1px solid rgba(240,164,41,0.2)',
              borderRadius: 16, display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: 20,
            }}>
              <Bot size={24} color="var(--amber)" />
            </div>
            <h2 className="display" style={{ fontSize: 22, color: 'var(--fg)', marginBottom: 8, fontWeight: 400 }}>
              Start a conversation
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', maxWidth: 360, lineHeight: 1.65 }}>
              Ask anything. I&apos;ll search your uploaded documents to give you grounded answers.
            </p>
          </div>
        ) : (
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
            {messages.map((msg, i) => (
              <div key={msg.id} className="animate-fade-up" style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                gap: 12,
                animationDelay: `${i * 0.03}s`,
              }}>
                {/* Avatar */}
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.role === 'user' ? 'var(--amber)' : 'var(--bg-subtle)',
                  border: msg.role === 'assistant' ? '1px solid var(--border-subtle)' : 'none',
                  marginTop: 2,
                }}>
                  {msg.role === 'user'
                    ? <User size={14} color="#0C0C0E" />
                    : <Bot size={14} color="var(--fg-muted)" />
                  }
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: '78%',
                  background: msg.role === 'user' ? 'var(--amber)' : 'var(--bg-card)',
                  border: msg.role === 'assistant' ? '1px solid var(--border-subtle)' : 'none',
                  borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                  padding: '12px 16px',
                  color: msg.role === 'user' ? '#0C0C0E' : 'var(--fg)',
                  fontSize: 14,
                  lineHeight: 1.7,
                  fontWeight: msg.role === 'user' ? 500 : 400,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="animate-fade-in" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={14} color="var(--fg-muted)" />
                </div>
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  borderRadius: '4px 14px 14px 14px', padding: '14px 18px',
                  display: 'flex', gap: 5, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--fg-subtle)',
                      animation: 'pulse-amber 1.2s ease infinite',
                      animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 'var(--radius)', padding: '12px 16px',
                color: 'var(--red)', fontSize: 13,
              }}>
                <AlertCircle size={15} />
                {error.message.includes('LIMIT_REACHED')
                  ? 'Token limit reached. Upgrade your plan in Billing.'
                  : 'Something went wrong. Please try again.'}
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        padding: '16px 24px',
      }}>
        <form onSubmit={handleSubmit} style={{
          display: 'flex', gap: 10,
          maxWidth: 720, margin: '0 auto',
        }}>
          <input
            className="input"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything…"
            disabled={isLoading}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-primary"
            style={{
              width: 42, height: 42, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Send size={15} color="#0C0C0E" />
          </button>
        </form>
      </div>

    </div>
  )
}
