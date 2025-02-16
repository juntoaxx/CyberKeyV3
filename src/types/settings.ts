export interface ApiKeyDefaults {
  expirationDays: number
  usageLimit: number | null
  allowedDomains: string[]
}

export interface NotificationSettings {
  emailNotifications: boolean
  balanceAlerts: boolean
  lowBalanceThreshold: number
  keyExpirationWarning: boolean
  keyExpirationDays: number
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  timezone: string
  currency: 'USD' | 'EUR' | 'GBP'
}

export interface UserSettings {
  apiKeyDefaults: ApiKeyDefaults
  notifications: NotificationSettings
  preferences: UserPreferences
}

export interface SettingsContextType {
  settings: UserSettings | null
  isLoading: boolean
  error: Error | null
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>
  resetSettings: () => Promise<void>
}
