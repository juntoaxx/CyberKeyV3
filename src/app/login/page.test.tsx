import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './page'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { getApps, initializeApp } from 'firebase/app'

// Mock the auth context
jest.mock('@/contexts/auth-context', () => ({
  ...jest.requireActual('@/contexts/auth-context'),
  useAuth: jest.fn(),
}))
const mockUseAuth = useAuth as jest.Mock

// Mock Firebase
jest.mock('firebase/app', () => ({
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(() => ({
    name: '[DEFAULT]',
    options: {},
  })),
  getApp: jest.fn(),
}))

const renderWithAuth = (ui: React.ReactElement, authState = {}) => {
  mockUseAuth.mockReturnValue({
    user: null,
    loading: false,
    signInWithGoogle: jest.fn(),
    ...authState,
  })
  return render(<AuthProvider>{ui}</AuthProvider>)
}

describe('LoginPage', () => {
  const mockSignInWithGoogle = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful app initialization
    ;(getApps as jest.Mock).mockReturnValue([])
    ;(initializeApp as jest.Mock).mockReturnValue({
      name: '[DEFAULT]',
      options: {},
    })
  })

  it('renders login page correctly', () => {
    renderWithAuth(<LoginPage />, {
      signInWithGoogle: mockSignInWithGoogle,
    })

    expect(screen.getByText(/Welcome to CyberKey V3/i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls signInWithGoogle when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithAuth(<LoginPage />, {
      signInWithGoogle: mockSignInWithGoogle,
    })

    const signInButton = screen.getByRole('button')
    await user.click(signInButton)

    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
  })

  it('handles successful sign in', async () => {
    mockSignInWithGoogle.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderWithAuth(<LoginPage />, {
      signInWithGoogle: mockSignInWithGoogle,
    })

    const signInButton = screen.getByRole('button')
    await user.click(signInButton)

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled()
    })
  })

  it('handles sign in error', async () => {
    const error = new Error('Sign in failed')
    mockSignInWithGoogle.mockRejectedValue(error)
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const user = userEvent.setup()

    renderWithAuth(<LoginPage />, {
      signInWithGoogle: mockSignInWithGoogle,
    })

    const signInButton = screen.getByRole('button')
    await user.click(signInButton)

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled()
    })

    consoleSpy.mockRestore()
  })
})
