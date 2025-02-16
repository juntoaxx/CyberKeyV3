import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { ApiKeyList } from './api-key-list'
import { ApiKeyService } from '@/lib/services/api-key-service'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/components/ui/use-toast'

// Mock dependencies
jest.mock('@/contexts/auth-context')
jest.mock('@/lib/services/api-key-service')
jest.mock('@/components/ui/use-toast')

// Mock components
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

jest.mock('@/components/common/copy-button', () => ({
  CopyButton: ({ text, onCopy }: any) => (
    <button onClick={onCopy} data-testid="copy-button">
      Copy
    </button>
  ),
}))

// Mock icons
jest.mock('lucide-react', () => ({
  Trash2: () => <span data-testid="trash-icon">🗑</span>,
  ExternalLink: () => <span data-testid="external-link-icon">↗</span>,
  DollarSign: () => <span data-testid="dollar-sign-icon">$</span>,
}))

jest.mock('@heroicons/react/24/outline', () => ({
  MagnifyingGlassIcon: () => <span data-testid="search-icon">🔍</span>,
}))

describe('ApiKeyList', () => {
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

  const mockApiKeyService = {
    getApiKeys: jest.fn().mockResolvedValue(mockApiKeys),
    deleteApiKey: jest.fn().mockResolvedValue(undefined),
    toggleApiKeyStatus: jest.fn().mockResolvedValue(undefined)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })
    ;(ApiKeyService.getInstance as jest.Mock).mockReturnValue(mockApiKeyService)
  })

  it('renders loading state initially', () => {
    render(<ApiKeyList />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders API keys after loading', async () => {
    render(<ApiKeyList />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Key 1')).toBeInTheDocument()
      expect(screen.getByText('Test Key 2')).toBeInTheDocument()
    })
  })

  it('handles API key deletion', async () => {
    render(<ApiKeyList />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Key 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: /delete api key/i })
    fireEvent.click(deleteButtons[0])

    expect(mockApiKeyService.deleteApiKey).toHaveBeenCalledWith('1')
    expect(toast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'API key deleted successfully'
    })
  })

  it('handles API key status toggle', async () => {
    render(<ApiKeyList />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Key 1')).toBeInTheDocument()
    })

    const toggleButtons = screen.getAllByRole('switch')
    fireEvent.click(toggleButtons[0])

    expect(mockApiKeyService.toggleApiKeyStatus).toHaveBeenCalledWith('1', false)
    expect(toast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'API key deactivated successfully'
    })
  })

  it('handles copying API key to clipboard', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    })

    render(<ApiKeyList />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Key 1')).toBeInTheDocument()
    })

    const copyButtons = screen.getAllByRole('button', { name: /copy/i })
    fireEvent.click(copyButtons[0])

    expect(mockWriteText).toHaveBeenCalledWith('sk-test-123')
    expect(toast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'API key copied to clipboard'
    })
  })

  it('handles search and filtering', async () => {
    render(<ApiKeyList />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Key 1')).toBeInTheDocument()
      expect(screen.getByText('Test Key 2')).toBeInTheDocument()
    })

    // Test search by name
    const searchInput = screen.getByPlaceholderText(/search api keys/i)
    fireEvent.change(searchInput, { target: { value: 'Key 1' } })
    
    expect(screen.getByText('Test Key 1')).toBeInTheDocument()
    expect(screen.queryByText('Test Key 2')).not.toBeInTheDocument()

    // Test search by service
    fireEvent.change(searchInput, { target: { value: 'OpenAI' } })
    expect(screen.getByText('Test Key 1')).toBeInTheDocument()
    expect(screen.queryByText('Test Key 2')).not.toBeInTheDocument()

    // Test filtering by status
    fireEvent.change(searchInput, { target: { value: '' } })
    const statusFilter = screen.getByRole('combobox', { name: /status/i })
    fireEvent.change(statusFilter, { target: { value: 'active' } })
    
    expect(screen.getByText('Test Key 1')).toBeInTheDocument()
    expect(screen.queryByText('Test Key 2')).not.toBeInTheDocument()
  })

  it('handles sorting', async () => {
    render(<ApiKeyList />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Key 1')).toBeInTheDocument()
      expect(screen.getByText('Test Key 2')).toBeInTheDocument()
    })

    const sortSelect = screen.getByRole('combobox', { name: /sort/i })
    
    // Test sort by name
    fireEvent.change(sortSelect, { target: { value: 'name' } })
    const items = screen.getAllByTestId('card')
    expect(items[0]).toHaveTextContent('Test Key 1')
    expect(items[1]).toHaveTextContent('Test Key 2')

    // Test sort by date
    fireEvent.change(sortSelect, { target: { value: 'dateAdded' } })
    const itemsAfterSort = screen.getAllByTestId('card')
    expect(itemsAfterSort[0]).toHaveTextContent('Test Key 2')
    expect(itemsAfterSort[1]).toHaveTextContent('Test Key 1')
  })

  it('displays error state when API fails', async () => {
    const mockError = new Error('Failed to load API keys')
    mockApiKeyService.getApiKeys.mockRejectedValueOnce(mockError)

    render(<ApiKeyList />)
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive'
      })
    })
  })

  it('handles empty state', async () => {
    mockApiKeyService.getApiKeys.mockResolvedValueOnce([])

    render(<ApiKeyList />)
    
    await waitFor(() => {
      expect(screen.getByText(/no api keys stored yet/i)).toBeInTheDocument()
    })
  })
})
