import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { ApiKeyList } from './api-key-list'
import { ApiKeyService } from '@/lib/services/api-key-service'
import { useAuth } from '@/contexts/auth-context'

// Mock dependencies
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({ user: { uid: 'test-user-id' } }),
}))

jest.mock('@/lib/services/api-key-service', () => ({
  ApiKeyService: {
    getInstance: () => ({
      getApiKeys: () => Promise.resolve([]),
      deleteApiKey: jest.fn(),
      toggleApiKeyStatus: jest.fn()
    }),
  },
}))

jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}))

jest.mock('@/lib/encryption', () => ({
  encryptData: jest.fn((data) => `encrypted_${data}`),
  decryptData: jest.fn((data) => data.replace('encrypted_', '')),
}))

// Mock Date toLocaleDateString
const mockToLocaleDateString = jest.fn(() => '1/1/2024')
const originalDate = global.Date

class MockDate extends Date {
  constructor(date) {
    super(date)
  }

  toLocaleDateString() {
    return mockToLocaleDateString()
  }
}

global.Date = MockDate as DateConstructor

// Mock Intl.NumberFormat
const mockFormat = jest.fn((value) => `$${value.toFixed(2)}`)
const originalIntl = global.Intl
global.Intl = {
  ...originalIntl,
  NumberFormat: jest.fn().mockImplementation(() => ({
    format: mockFormat,
  })),
}

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Trash2: () => <span data-testid="trash-icon">🗑</span>,
  ExternalLink: () => <span data-testid="external-link-icon">↗</span>,
  DollarSign: () => <span data-testid="dollar-sign-icon">$</span>,
}))

// Mock ApiKeyDisplay component
jest.mock('./api-key-display', () => ({
  ApiKeyDisplay: ({ apiKey, label }: { apiKey: string; label: string }) => (
    <div data-testid="api-key-display">
      <span>{apiKey}</span>
      <span>{label}</span>
    </div>
  ),
}))

// Mock ShadCN components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={`card ${className || ''}`} data-testid="card">
      {children}
    </div>
  ),
  CardHeader: ({ children }: any) => (
    <div className="card-header" data-testid="card-header">
      {children}
    </div>
  ),
  CardTitle: ({ children }: any) => (
    <div className="card-title" data-testid="card-title">
      {children}
    </div>
  ),
  CardDescription: ({ children }: any) => (
    <div className="card-description" data-testid="card-description">
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => (
    <div className="card-content" data-testid="card-content">
      {children}
    </div>
  ),
}))

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, 'aria-label': ariaLabel }: any) => (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      data-testid="switch"
    />
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, 'aria-label': ariaLabel }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} data-testid="button">
      {children}
    </button>
  ),
}))

describe.skip('ApiKeyList', () => {
  it('exists as a component', () => {
    const { ApiKeyList } = require('./api-key-list')
    expect(ApiKeyList).toBeDefined()
  })

  const mockUser = { uid: 'test-user-id' }
  const mockApiKeys = [
    {
      id: '1',
      name: 'Test Key 1',
      service: 'OpenAI',
      key: 'sk-test-123',
      dateAdded: '2024-01-01T00:00:00.000Z',
      active: true,
      credit: 100.50,
      fundingUrl: 'https://example.com/billing'
    },
    {
      id: '2',
      name: 'Test Key 2',
      service: 'AWS',
      key: 'aws-test-456',
      dateAdded: '2024-01-02T00:00:00.000Z',
      active: false
    }
  ]

  const mockGetInstance = jest.fn(() => ({
    getApiKeys: jest.fn().mockResolvedValue(mockApiKeys),
    deleteApiKey: jest.fn(),
    toggleApiKeyStatus: jest.fn()
  }))

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })
    ;(ApiKeyService.getInstance as jest.Mock).mockImplementation(mockGetInstance)
  })

  afterAll(() => {
    global.Date = originalDate
    global.Intl = originalIntl
  })

  it('renders loading state initially', () => {
    render(<ApiKeyList />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders API keys with credit and funding information', async () => {
    render(<ApiKeyList />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Key 1')).toBeInTheDocument()
    })

    // Credit display
    expect(screen.getByText('$100.50')).toBeInTheDocument()
    
    // Funding URL link
    const fundingLink = screen.getByRole('link', { name: /add funds/i })
    expect(fundingLink).toBeInTheDocument()
    expect(fundingLink).toHaveAttribute('href', 'https://example.com/billing')
    expect(fundingLink).toHaveAttribute('target', '_blank')
    expect(fundingLink).toHaveAttribute('rel', 'noopener noreferrer')

    // Key without credit and funding URL
    expect(screen.getByText('Test Key 2')).toBeInTheDocument()
    const key2Element = screen.getByText('Test Key 2')
    const key2Card = key2Element.closest('[data-testid="card"]')
    expect(key2Card).not.toHaveTextContent('$')
    expect(key2Card).not.toHaveTextContent('Add Funds')
  })

  it('handles API key deletion', async () => {
    const mockDeleteApiKey = jest.fn().mockResolvedValue(undefined)
    mockGetInstance.mockReturnValue({
      getApiKeys: jest.fn().mockResolvedValue(mockApiKeys),
      deleteApiKey: mockDeleteApiKey,
      toggleApiKeyStatus: jest.fn()
    })

    render(<ApiKeyList />)

    await waitFor(() => {
      expect(screen.getByText('Test Key 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByLabelText('Delete API key')
    fireEvent.click(deleteButtons[0])

    expect(mockDeleteApiKey).toHaveBeenCalledWith('1')
    expect(toast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'API key deleted successfully'
    })
  })

  it('handles API key status toggle', async () => {
    const mockToggleApiKeyStatus = jest.fn().mockResolvedValue(undefined)
    mockGetInstance.mockReturnValue({
      getApiKeys: jest.fn().mockResolvedValue(mockApiKeys),
      deleteApiKey: jest.fn(),
      toggleApiKeyStatus: mockToggleApiKeyStatus
    })

    render(<ApiKeyList />)

    await waitFor(() => {
      expect(screen.getByText('Test Key 1')).toBeInTheDocument()
    })

    const toggles = screen.getAllByRole('switch')
    fireEvent.click(toggles[0])

    expect(mockToggleApiKeyStatus).toHaveBeenCalledWith('1', false)
    expect(toast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'API key deactivated successfully'
    })
  })

  it('handles loading state', () => {
    mockGetInstance.mockReturnValue({
      getApiKeys: jest.fn(() => new Promise(() => {})),
      deleteApiKey: jest.fn(),
      toggleApiKeyStatus: jest.fn()
    })
    
    render(<ApiKeyList />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles empty state', async () => {
    mockGetInstance.mockReturnValue({
      getApiKeys: jest.fn().mockResolvedValue([]),
      deleteApiKey: jest.fn(),
      toggleApiKeyStatus: jest.fn()
    })

    render(<ApiKeyList />)

    await waitFor(() => {
      expect(screen.getByText('No API keys stored yet')).toBeInTheDocument()
    })
  })

  it('handles error state', async () => {
    mockGetInstance.mockReturnValue({
      getApiKeys: jest.fn().mockRejectedValue(new Error('Failed to load')),
      deleteApiKey: jest.fn(),
      toggleApiKeyStatus: jest.fn()
    })

    render(<ApiKeyList />)

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive'
      })
    })
  })
})
