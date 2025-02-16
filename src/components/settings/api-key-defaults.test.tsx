import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiKeyDefaults } from './api-key-defaults'
import { useSettings } from '@/contexts/settings-context'

jest.mock('@/contexts/settings-context')

const mockSettings = {
  expirationDays: 30,
  usageLimit: 1000,
  allowedDomains: ['example.com']
}

describe('ApiKeyDefaults', () => {
  const mockUpdateSettings = jest.fn()

  beforeEach(() => {
    ;(useSettings as jest.Mock).mockReturnValue({
      settings: { apiKeyDefaults: mockSettings },
      updateSettings: mockUpdateSettings
    })
  })

  it('displays current expiration days', () => {
    render(<ApiKeyDefaults />)
    expect(screen.getByLabelText(/expiration days/i)).toHaveValue(30)
  })

  it('updates expiration days', async () => {
    render(<ApiKeyDefaults />)
    const input = screen.getByLabelText(/expiration days/i)
    await userEvent.clear(input)
    await userEvent.type(input, '60')

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKeyDefaults: { ...mockSettings, expirationDays: 60 }
        })
      )
    })
  })
})
