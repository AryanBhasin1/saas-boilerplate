'use client'
import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { X } from 'lucide-react'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8, width: 360 }}
    {...props}
  />
))
ToastViewport.displayName = 'ToastViewport'

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>
>(({ ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '14px 16px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}
    {...props}
  />
))
Toast.displayName = 'Toast'

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }} {...props} />
))
ToastTitle.displayName = 'ToastTitle'

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 2 }} {...props} />
))
ToastDescription.displayName = 'ToastDescription'

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    style={{ marginLeft: 'auto', color: 'var(--fg-subtle)', cursor: 'pointer', background: 'none', border: 'none', padding: 2 }}
    {...props}
  >
    <X size={14} />
  </ToastPrimitives.Close>
))
ToastClose.displayName = 'ToastClose'

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose }
export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
