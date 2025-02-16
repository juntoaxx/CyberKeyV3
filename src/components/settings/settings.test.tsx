import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DomainList } from './domain-list'
import { SettingsSection } from './settings-section'
import { Toast } from '../common/toast'

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  XMarkIcon: () => <div data-testid="mock-xmark-icon" />,
  CheckCircleIcon: () => <div data-testid="mock-check-icon" />,
  ExclamationCircleIcon: () => <div data-testid="mock-exclamation-icon" />,
}))

describe('Settings Components', () => {
  describe('DomainList', () => {
    const mockOnChange = jest.fn()
    const initialDomains = ['example.com', 'test.com']

    beforeEach(() => {
      mockOnChange.mockClear()
    })

    it('renders domain list correctly', () => {
      render(<DomainList domains={initialDomains} onChange={mockOnChange} />)
      
      initialDomains.forEach(domain => {
        expect(screen.getByText(domain)).toBeInTheDocument()
      })
    })

    it('adds valid domain', async () => {
      render(<DomainList domains={initialDomains} onChange={mockOnChange} />)
      
      const input = screen.getByPlaceholderText('example.com')
      const addButton = screen.getByText('Add')

      await userEvent.type(input, 'newdomain.com')
      fireEvent.click(addButton)

      expect(mockOnChange).toHaveBeenCalledWith([...initialDomains, 'newdomain.com'])
    })

    it('shows error for invalid domain', async () => {
      render(<DomainList domains={initialDomains} onChange={mockOnChange} />)
      
      const input = screen.getByPlaceholderText('example.com')
      const addButton = screen.getByText('Add')

      await userEvent.type(input, 'invalid-domain')
      fireEvent.click(addButton)

      expect(screen.getByText('Please enter a valid domain')).toBeInTheDocument()
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('removes domain when delete button is clicked', () => {
      render(<DomainList domains={initialDomains} onChange={mockOnChange} />)
      
      const deleteButtons = screen.getAllByTestId('mock-xmark-icon')
      fireEvent.click(deleteButtons[0])

      expect(mockOnChange).toHaveBeenCalledWith(['test.com'])
    })
  })

  describe('SettingsSection', () => {
    it('renders section with title and description', () => {
      const title = 'Test Section'
      const description = 'Test Description'
      const content = 'Test Content'

      render(
        <SettingsSection title={title} description={description}>
          {content}
        </SettingsSection>
      )

      expect(screen.getByText(title)).toBeInTheDocument()
      expect(screen.getByText(description)).toBeInTheDocument()
      expect(screen.getByText(content)).toBeInTheDocument()
    })
  })

  describe('Toast', () => {
    const mockOnClose = jest.fn()

    beforeEach(() => {
      mockOnClose.mockClear()
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('renders success toast correctly', () => {
      render(
        <Toast
          show={true}
          message="Success message"
          type="success"
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Success message')).toBeInTheDocument()
      expect(screen.getByTestId('mock-check-icon')).toBeInTheDocument()
    })

    it('renders error toast correctly', () => {
      render(
        <Toast
          show={true}
          message="Error message"
          type="error"
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Error message')).toBeInTheDocument()
      expect(screen.getByTestId('mock-exclamation-icon')).toBeInTheDocument()
    })

    it('closes automatically after 5 seconds', async () => {
      render(
        <Toast
          show={true}
          message="Test message"
          type="success"
          onClose={mockOnClose}
        />
      )

      jest.advanceTimersByTime(5000)
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('closes when close button is clicked', () => {
      render(
        <Toast
          show={true}
          message="Test message"
          type="success"
          onClose={mockOnClose}
        />
      )

      const closeButton = screen.getByLabelText('Close')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
