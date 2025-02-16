import React from 'react'
import { render, screen } from '@testing-library/react'
import SettingsPage from './index'
import { useSettings } from '@/contexts/settings-context'

// Mock dependencies
jest.mock('@/contexts/settings-context')
jest.mock('@/components/dashboard/dashboard-layout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
jest.mock('@/components/settings/api-key-defaults', () => ({
  ApiKeyDefaults: () => <div data-testid="api-key-defaults">API Key Defaults</div>,
}))
jest.mock('@/components/settings/notification-settings', () => ({
  NotificationSettings: () => <div data-testid="notification-settings">Notification Settings</div>,
}))
jest.mock('@/components/settings/preferences', () => ({
  Preferences: () => <div data-testid="preferences">Preferences</div>,
}))

const mockSettings = {
  apiKeyDefaults: {
    expirationDays: 30,
    usageLimit: 1000,
  },
  notifications: {
    emailEnabled: true,
    balanceAlerts: true,
  },
  preferences: {
    theme: 'light',
    dateFormat: 'MM/DD/YYYY',
  },
}

describe('SettingsPage', () => {
  const mockUseSettings = useSettings as jest.Mock

  beforeEach(() => {
    mockUseSettings.mockReturnValue({
      settings: mockSettings,
      isLoading: false,
      error: null,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders settings page title', () => {
    render(<SettingsPage />)
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument()
  })

  it('renders all settings sections when loaded', () => {
    render(<SettingsPage />)
    expect(screen.getByTestId('api-key-defaults')).toBeInTheDocument()
    expect(screen.getByTestId('notification-settings')).toBeInTheDocument()
    expect(screen.getByTestId('preferences')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseSettings.mockReturnValue({
      settings: null,
      isLoading: true,
      error: null,
    })
    render(<SettingsPage />)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('shows error message when loading fails', () => {
    const errorMessage = 'Failed to load settings'
    mockUseSettings.mockReturnValue({
      settings: null,
      isLoading: false,
      error: new Error(errorMessage),
    })
    render(<SettingsPage />)
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })
})
