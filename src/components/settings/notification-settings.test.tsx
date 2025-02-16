import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationSettings } from './notification-settings'
import { useSettings } from '@/contexts/settings-context'

jest.mock('@/contexts/settings-context')

const mockSettings = {
  emailNotifications: true,
  balanceAlerts: true,
  lowBalanceThreshold: 100,
  keyExpirationWarning: true,
  keyExpirationDays: 7
}

describe('NotificationSettings', () => {
  const mockUpdateSettings = jest.fn()

  beforeEach(() => {
    ;(useSettings as jest.Mock).mockReturnValue({
      settings: { notifications: mockSettings },
      updateSettings: mockUpdateSettings
    })
  })

  it('displays notification toggles correctly', () => {
    render(<NotificationSettings />)
    expect(screen.getByRole('switch', { name: /email notifications/i }))
      .toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('switch', { name: /balance alerts/i }))
      .toHaveAttribute('aria-checked', 'true')
  })

  it('toggles email notifications', async () => {
    render(<NotificationSettings />)
    const toggle = screen.getByRole('switch', { name: /email notifications/i })
    await userEvent.click(toggle)

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications: { ...mockSettings, emailNotifications: false }
        })
      )
    })
  })
})
