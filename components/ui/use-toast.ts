'use client'
import { useState, useCallback } from 'react'
import type React from 'react'
import type { ToastProps } from './toast'

interface ToastItem extends ToastProps {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
}

let count = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback(({ title, description, ...props }: Omit<ToastItem, 'id'>) => {
    const id = String(++count)
    setToasts(prev => [...prev, { id, title, description, ...props }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, toast, dismiss }
}
