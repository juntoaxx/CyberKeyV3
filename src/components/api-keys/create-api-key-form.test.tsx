/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateApiKeyForm } from './create-api-key-form'
import { ApiKeyService } from '@/lib/services/api-key-service'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

// Mock dependencies
jest.mock('next/navigation')
jest.mock('@/contexts/auth-context')
jest.mock('@/lib/services/api-key-service')
jest.mock('@/components/ui/use-toast')

describe('CreateApiKeyForm', () => {
  const mockUser = { uid: 'test-user-id' }
  const mockRouter = { refresh: jest.fn() }
  const mockStoreApiKey = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(ApiKeyService.getInstance as jest.Mock).mockReturnValue({
      storeApiKey: mockStoreApiKey
    })
  })

  const fillAndSubmitForm = async (
    {
      name = 'Test Key',
      service = 'OpenAI',
      key = 'sk-test-123',
      credit = '100.50',
      fundingUrl = 'https://example.com/billing'
    } = {}
  ) => {
    render(<CreateApiKeyForm />)

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/service name/i), {
      target: { value: service }
    })
    fireEvent.change(screen.getByLabelText(/key name/i), {
      target: { value: name }
    })
    fireEvent.change(screen.getByLabelText(/api key/i), {
      target: { value: key }
    })

    // Fill optional fields
    if (credit) {
      fireEvent.change(screen.getByLabelText(/available credit/i), {
        target: { value: credit }
      })
    }
    if (fundingUrl) {
      fireEvent.change(screen.getByLabelText(/funding page url/i), {
        target: { value: fundingUrl }
      })
    }

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /store api key/i }))
  }

  it('renders all form fields', () => {
    render(<CreateApiKeyForm />)

    expect(screen.getByLabelText(/service name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/key name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/api key/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/available credit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/funding page url/i)).toBeInTheDocument()
  })

  it('submits form with all fields including credit and funding URL', async () => {
    await fillAndSubmitForm()

    expect(mockStoreApiKey).toHaveBeenCalledWith(
      'test-user-id',
      expect.objectContaining({
        name: 'Test Key',
        service: 'OpenAI',
        key: 'sk-test-123',
        credit: 100.50,
        fundingUrl: 'https://example.com/billing',
        dateAdded: expect.any(String)
      })
    )

    expect(toast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'API key stored successfully'
    })
    expect(mockRouter.refresh).toHaveBeenCalled()
  })

  it('submits form without optional fields', async () => {
    await fillAndSubmitForm({
      name: 'Test Key',
      service: 'OpenAI',
      key: 'sk-test-123',
      credit: '',
      fundingUrl: ''
    })

    expect(mockStoreApiKey).toHaveBeenCalledWith(
      'test-user-id',
      expect.objectContaining({
        name: 'Test Key',
        service: 'OpenAI',
        key: 'sk-test-123',
        credit: 0,
        fundingUrl: null,
        dateAdded: expect.any(String)
      })
    )
  })

  it('validates credit as a number', async () => {
    render(<CreateApiKeyForm />)

    const creditInput = screen.getByLabelText(/available credit/i)
    fireEvent.change(creditInput, { target: { value: 'invalid' } })
    
    expect(creditInput).toHaveAttribute('type', 'number')
    expect(creditInput).toHaveAttribute('step', '0.01')
    expect(creditInput).toHaveAttribute('min', '0')
  })

  it('validates funding URL format', async () => {
    render(<CreateApiKeyForm />)

    const urlInput = screen.getByLabelText(/funding page url/i)
    fireEvent.change(urlInput, { target: { value: 'invalid-url' } })
    
    expect(urlInput).toHaveAttribute('type', 'url')
  })

  it('handles form submission error', async () => {
    mockStoreApiKey.mockRejectedValueOnce(new Error('Failed to store'))

    await fillAndSubmitForm()

    expect(toast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to store API key',
      variant: 'destructive'
    })
  })

  it('clears form after successful submission', async () => {
    await fillAndSubmitForm()

    await waitFor(() => {
      expect(screen.getByLabelText(/service name/i)).toHaveValue('')
      expect(screen.getByLabelText(/key name/i)).toHaveValue('')
      expect(screen.getByLabelText(/api key/i)).toHaveValue('')
      expect(screen.getByLabelText(/available credit/i)).toHaveValue('')
      expect(screen.getByLabelText(/funding page url/i)).toHaveValue('')
    })
  })

  it('requires authentication', () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: null })
    render(<CreateApiKeyForm />)

    const submitButton = screen.getByRole('button', { name: /store api key/i })
    fireEvent.click(submitButton)

    expect(mockStoreApiKey).not.toHaveBeenCalled()
  })
})
