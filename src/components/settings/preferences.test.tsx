import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Preferences } from './preferences'
import { useSettings } from '@/contexts/settings-context'

jest.mock('@/contexts/settings-context')

const mockSettings = {
  theme: 'light',
  dateFormat: 'MM/DD/YYYY',
  timezone: 'UTC',
  currency: 'USD'
}

describe('Preferences', () => {
  const mockUpdateSettings = jest.fn()

  beforeEach(() => {
    ;(useSettings as jest.Mock).mockReturnValue({
      settings: { preferences: mockSettings },
      updateSettings: mockUpdateSettings
    })
  })

  it('displays current preferences', () => {
    render(<Preferences />)
    expect(screen.getByLabelText(/theme/i)).toHaveValue('light')
    expect(screen.getByLabelText(/date format/i)).toHaveValue('MM/DD/YYYY')
  })

  it('updates theme preference', async () => {
    render(<Preferences />)
    const select = screen.getByLabelText(/theme/i)
    await userEvent.selectOptions(select, 'dark')

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          preferences: { ...mockSettings, theme: 'dark' }
        })
      )
    })
  })
})
