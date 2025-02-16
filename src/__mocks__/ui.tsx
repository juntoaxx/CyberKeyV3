import React from 'react'

export const Button = ({
  children,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button onClick={onClick} {...props}>
    {children}
  </button>
)

export const Input = ({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />

export const Table = ({ children }: { children: React.ReactNode }) => (
  <table>{children}</table>
)

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead>{children}</thead>
)

export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>{children}</tbody>
)

export const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr>{children}</tr>
)

export const TableHead = ({ children }: { children: React.ReactNode }) => (
  <th>{children}</th>
)

export const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td>{children}</td>
)

export const toast = (props: any) => props
