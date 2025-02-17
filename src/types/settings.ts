export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  browserEnabled: boolean;
  daysBeforeExpiration: number; // Send notification X days before expiration
  balanceAlerts: boolean;
  lowBalanceThreshold: number;
  notificationFrequency: 'hourly' | 'daily' | 'weekly';
  smtpSettings?: SmtpSettings;
  notificationEmail?: string; // Email address to receive notifications
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  timezone: string
  defaultExpirationDays: number
}

export interface UserSettings {
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
