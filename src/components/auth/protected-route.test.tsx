/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import { ProtectedRoute } from './protected-route'
import { useAuth } from '@/contexts/auth-context'
import { redirect } from 'next/navigation'

jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}))

describe('ProtectedRoute', () => {
  const mockContent = 'Protected Content'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('shows loading state', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    })

    render(
      <ProtectedRoute>
        <div>{mockContent}</div>
      </ProtectedRoute>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  test('redirects when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    })

    render(
      <ProtectedRoute>
        <div>{mockContent}</div>
      </ProtectedRoute>
    )

    expect(redirect).toHaveBeenCalledWith('/login')
  })

  test('renders children when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
    })

    render(
      <ProtectedRoute>
        <div>{mockContent}</div>
      </ProtectedRoute>
    )

    expect(screen.getByText(mockContent)).toBeInTheDocument()
  })
})
