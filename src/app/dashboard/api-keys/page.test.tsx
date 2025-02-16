import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApiKeysPage from './page'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { ApiKeyService } from '@/lib/services/api-key-service'
import { getApps, initializeApp } from 'firebase/app'
import { toast } from '@/components/ui/use-toast'

// Mock the auth context
jest.mock('@/contexts/auth-context', () => ({
  ...jest.requireActual('@/contexts/auth-context'),
  useAuth: jest.fn(),
}))
const mockUseAuth = useAuth as jest.Mock

// Mock the API key service
jest.mock('@/lib/services/api-key-service')
const mockApiKeyService = ApiKeyService as jest.Mocked<typeof ApiKeyService>

// Mock the toast component
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}))

// Mock Firebase
jest.mock('firebase/app', () => ({
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(() => ({
    name: '[DEFAULT]',
    options: {},
  })),
  getApp: jest.fn(),
}))

const mockApiKeys = [
  {
    id: '1',
    name: 'Test Key 1',
    key: 'test-key-1',
    userId: 'user1',
    balance: 100,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    allowedOrigins: ['*'],
    rateLimit: 100,
  },
]

const renderWithAuth = (ui: React.ReactElement, authState = {}) => {
  mockUseAuth.mockReturnValue({
    user: { uid: 'user1', email: 'test@example.com' },
    loading: false,
    ...authState,
  })
  return render(<AuthProvider>{ui}</AuthProvider>)
}

describe('ApiKeysPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful app initialization
    ;(getApps as jest.Mock).mockReturnValue([])
    ;(initializeApp as jest.Mock).mockReturnValue({
      name: '[DEFAULT]',
      options: {},
    })
    // Mock API key service methods
    mockApiKeyService.listApiKeys.mockResolvedValue(mockApiKeys)
    mockApiKeyService.createApiKey.mockResolvedValue(mockApiKeys[0])
    mockApiKeyService.deleteApiKey.mockResolvedValue()
  })

  it('renders API keys page with loading state', () => {
    renderWithAuth(<ApiKeysPage />, { loading: true })
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders API keys list when data is loaded', async () => {
    renderWithAuth(<ApiKeysPage />)

    await waitFor(() => {
      expect(mockApiKeyService.listApiKeys).toHaveBeenCalled()
    })

    expect(screen.getByText('Test Key 1')).toBeInTheDocument()
  })

  it('creates a new API key', async () => {
    const user = userEvent.setup()
    renderWithAuth(<ApiKeysPage />)

    const createButton = screen.getByRole('button', { name: /create/i })
    await user.click(createButton)

    await waitFor(() => {
      expect(mockApiKeyService.createApiKey).toHaveBeenCalled()
    })
    expect(toast).toHaveBeenCalled()
  })

  it('deletes an API key', async () => {
    const user = userEvent.setup()
    renderWithAuth(<ApiKeysPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Key 1')).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    await waitFor(() => {
      expect(mockApiKeyService.deleteApiKey).toHaveBeenCalled()
    })
    expect(toast).toHaveBeenCalled()
  })

  it('handles API key creation error', async () => {
    const error = new Error('Failed to create API key')
    mockApiKeyService.createApiKey.mockRejectedValue(error)
    const user = userEvent.setup()
    renderWithAuth(<ApiKeysPage />)

    const createButton = screen.getByRole('button', { name: /create/i })
    await user.click(createButton)

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: expect.any(String),
        variant: 'destructive',
      })
    })
  })

  it('handles API key deletion error', async () => {
    const error = new Error('Failed to delete API key')
    mockApiKeyService.deleteApiKey.mockRejectedValue(error)
    const user = userEvent.setup()
    renderWithAuth(<ApiKeysPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Key 1')).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: expect.any(String),
        variant: 'destructive',
      })
    })
  })
})
