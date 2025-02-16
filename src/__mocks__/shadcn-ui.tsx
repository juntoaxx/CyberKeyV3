import React from 'react'

// Mock Button component
export const Button = ({ children, onClick, ...props }: any) => (
  <button onClick={onClick} {...props}>
    {children}
  </button>
)

// Mock Input component
export const Input = React.forwardRef(({ ...props }: any, ref) => (
  <input ref={ref} {...props} />
))
Input.displayName = 'Input'

// Mock Label component
export const Label = ({ children, htmlFor, ...props }: any) => (
  <label htmlFor={htmlFor} {...props}>
    {children}
  </label>
)

// Mock Dialog components
export const Dialog = ({ children, open, onOpenChange, ...props }: any) => (
  <div data-testid="dialog" data-open={open} {...props}>
    {children}
  </div>
)

export const DialogTrigger = ({ children, asChild, ...props }: any) => (
  <div data-testid="dialog-trigger" {...props}>
    {children}
  </div>
)

export const DialogContent = ({ children, ...props }: any) => (
  <div data-testid="dialog-content" {...props}>
    {children}
  </div>
)

export const DialogHeader = ({ children, ...props }: any) => (
  <div data-testid="dialog-header" {...props}>
    {children}
  </div>
)

export const DialogTitle = ({ children, ...props }: any) => (
  <div data-testid="dialog-title" {...props}>
    {children}
  </div>
)

export const DialogDescription = ({ children, ...props }: any) => (
  <div data-testid="dialog-description" {...props}>
    {children}
  </div>
)

export const DialogFooter = ({ children, ...props }: any) => (
  <div data-testid="dialog-footer" {...props}>
    {children}
  </div>
)

// Mock Card components
export const Card = ({ children, ...props }: any) => (
  <div data-testid="card" {...props}>
    {children}
  </div>
)

export const CardHeader = ({ children, ...props }: any) => (
  <div data-testid="card-header" {...props}>
    {children}
  </div>
)

export const CardTitle = ({ children, ...props }: any) => (
  <div data-testid="card-title" {...props}>
    {children}
  </div>
)

export const CardDescription = ({ children, ...props }: any) => (
  <div data-testid="card-description" {...props}>
    {children}
  </div>
)

export const CardContent = ({ children, ...props }: any) => (
  <div data-testid="card-content" {...props}>
    {children}
  </div>
)

export const CardFooter = ({ children, ...props }: any) => (
  <div data-testid="card-footer" {...props}>
    {children}
  </div>
)

// Mock toast
export const toast = jest.fn()

// Export all components as a single object
export default {
  Button,
  Input,
  Label,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  toast,
}
