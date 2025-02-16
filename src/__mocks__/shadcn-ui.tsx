import React from 'react'

// Mock Button component
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, ...props }, ref) => (
  <button ref={ref} className={className} {...props}>
    {children}
  </button>
))
Button.displayName = 'Button'

// Mock Input component
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={className} {...props} />
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

// Mock Table components
export const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ children, className, ...props }, ref) => (
  <table ref={ref} className={className} {...props}>
    {children}
  </table>
))
Table.displayName = 'Table'

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ children, className, ...props }, ref) => (
  <thead ref={ref} className={className} {...props}>
    {children}
  </thead>
))
TableHeader.displayName = 'TableHeader'

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ children, className, ...props }, ref) => (
  <tbody ref={ref} className={className} {...props}>
    {children}
  </tbody>
))
TableBody.displayName = 'TableBody'

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ children, className, ...props }, ref) => (
  <tr ref={ref} className={className} {...props}>
    {children}
  </tr>
))
TableRow.displayName = 'TableRow'

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ children, className, ...props }, ref) => (
  <th ref={ref} className={className} {...props}>
    {children}
  </th>
))
TableHead.displayName = 'TableHead'

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ children, className, ...props }, ref) => (
  <td ref={ref} className={className} {...props}>
    {children}
  </td>
))
TableCell.displayName = 'TableCell'

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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  toast,
}
