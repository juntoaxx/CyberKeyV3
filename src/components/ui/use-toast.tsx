import * as React from 'react'

export interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function toast(props: ToastProps) {
  return props
}
