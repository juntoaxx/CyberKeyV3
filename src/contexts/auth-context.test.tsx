import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './auth-context'
import { getAuth, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { getApps, initializeApp } from 'firebase/app'

// Mock Firebase modules
jest.mock('firebase/app', () => ({
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(() => ({
    name: '[DEFAULT]',
    options: {},
  })),
  getApp: jest.fn(),
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
  })),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(() => ({})),
  signOut: jest.fn(),
}))

// Test component that uses auth context
const TestComponent = () => {
  const { user, loading, signInWithGoogle, logout } = useAuth()
  return (
    <div>
      {loading && <div>Loading...</div>}
      {user ? (
        <div>Logged in as {user.email}</div>
      ) : (
        <button onClick={signInWithGoogle}>Sign In</button>
      )}
      {user && <button onClick={logout}>Sign Out</button>}
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful app initialization
    ;(getApps as jest.Mock).mockReturnValue([])
    ;(initializeApp as jest.Mock).mockReturnValue({
      name: '[DEFAULT]',
      options: {},
    })
  })

  it('provides loading state initially', () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      // Don't call callback immediately to simulate loading
      return () => {}
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('updates auth state when user signs in', async () => {
    const mockUser = { email: 'test@example.com' }
    let authStateCallback: any
    
    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      authStateCallback = callback
      return () => {}
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Simulate auth state change
    await act(async () => {
      authStateCallback(mockUser)
    })

    expect(screen.getByText('Logged in as test@example.com')).toBeInTheDocument()
  })

  it('handles sign in with Google', async () => {
    const mockUser = { email: 'test@example.com' }
    ;(signInWithPopup as jest.Mock).mockResolvedValue({ user: mockUser })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signInButton = screen.getByText('Sign In')
    await act(async () => {
      signInButton.click()
    })

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled()
    })
  })

  it('handles sign out', async () => {
    ;(signOut as jest.Mock).mockResolvedValue(undefined)
    const { signOut: contextSignOut } = useAuth()

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      contextSignOut && contextSignOut()
    })

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled()
    })
  })
})
