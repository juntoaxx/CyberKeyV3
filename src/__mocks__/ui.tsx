import React from 'react'

export function Button({ children, onClick, ...props }: any) {
  return (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
}

export function Card({ children, ...props }: any) {
  return (
    <div {...props} data-testid="card">
      {children}
    </div>
  )
}

export function CardHeader({ children, ...props }: any) {
  return (
    <div {...props} data-testid="card-header">
      {children}
    </div>
  )
}

export function CardTitle({ children, ...props }: any) {
  return (
    <div {...props} data-testid="card-title">
      {children}
    </div>
  )
}

export function CardContent({ children, ...props }: any) {
  return (
    <div {...props} data-testid="card-content">
      {children}
    </div>
  )
}

export function toast({ title, description, variant }: any) {
  // Mock implementation
  return {
    title,
    description,
    variant,
  }
}
