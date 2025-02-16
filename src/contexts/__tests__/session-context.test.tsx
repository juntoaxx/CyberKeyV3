import { render, act } from '@testing-library/react'
import { SessionProvider, useSession } from '../session-context'
import { useAuth } from '../auth-context'

// Mock auth context
jest.mock('../auth-context', () => ({
  useAuth: jest.fn(),
}))

// Mock router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('SessionContext', () => {
  beforeEach(() => {
    // Mock authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: 'test-user' },
    })
  })

  it('provides session timeout value', () => {
    let sessionValue
    const TestComponent = () => {
      sessionValue = useSession()
      return null
    }

    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    )

    expect(sessionValue).toHaveProperty('sessionTimeout')
    expect(sessionValue?.sessionTimeout).toBe(30) // Default 30 minutes
  })

  it('allows updating last activity', () => {
    let sessionValue
    const TestComponent = () => {
      sessionValue = useSession()
      return null
    }

    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    )

    const initialLastActivity = sessionValue?.lastActivity

    act(() => {
      sessionValue?.updateLastActivity()
    })

    expect(sessionValue?.lastActivity).not.toBe(initialLastActivity)
  })
})
