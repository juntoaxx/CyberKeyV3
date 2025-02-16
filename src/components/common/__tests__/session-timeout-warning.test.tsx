import { render, screen, fireEvent, act } from '@/test/test-utils'
import '@testing-library/jest-dom'
import { SessionTimeoutWarning } from '../session-timeout-warning'
import { signOut, getAuth } from 'firebase/auth'
import { useSession } from '@/contexts/session-context'

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signOut: jest.fn(() => Promise.resolve())
}))

// Mock session context
jest.mock('@/contexts/session-context', () => ({
  useSession: jest.fn()
}))

const mockUseSession = jest.requireMock('@/contexts/session-context').useSession

describe('SessionTimeoutWarning', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSession.mockReturnValue({
      remainingTime: 240,
      updateLastActivity: jest.fn(),
      sessionTimeout: 1800
    })
  })

  it('shows warning when session is about to expire', () => {
    render(<SessionTimeoutWarning />)
    expect(screen.getByText(/your session will expire/i)).toBeInTheDocument()
    expect(screen.getByText(/4 minutes/i)).toBeInTheDocument()
  })

  it('allows extending session', async () => {
    const updateLastActivity = jest.fn()
    mockUseSession.mockReturnValue({
      remainingTime: 240,
      updateLastActivity,
      sessionTimeout: 1800
    })

    render(<SessionTimeoutWarning />)
    
    await act(async () => {
      fireEvent.click(screen.getByText(/extend session/i))
    })
    
    expect(updateLastActivity).toHaveBeenCalled()
  })

  it('handles logout', async () => {
    const mockRouter = { push: jest.fn() }
    mockUseSession.mockReturnValue({
      remainingTime: 240,
      updateLastActivity: jest.fn(),
      sessionTimeout: 1800
    })

    render(<SessionTimeoutWarning />)
    
    await act(async () => {
      fireEvent.click(screen.getByText(/logout/i))
    })
    
    expect(signOut).toHaveBeenCalledWith(getAuth())
    expect(mockRouter.push).toHaveBeenCalledWith('/login')
  })

  it('hides warning when plenty of time remains', () => {
    mockUseSession.mockReturnValue({
      remainingTime: 1200,
      updateLastActivity: jest.fn(),
      sessionTimeout: 1800
    })

    render(<SessionTimeoutWarning />)
    expect(screen.queryByText(/your session will expire/i)).not.toBeInTheDocument()
  })

  it('updates remaining time display', () => {
    mockUseSession.mockReturnValue({
      remainingTime: 120,
      updateLastActivity: jest.fn(),
      sessionTimeout: 1800
    })

    render(<SessionTimeoutWarning />)
    expect(screen.getByText(/2 minutes/i)).toBeInTheDocument()
  })
})
