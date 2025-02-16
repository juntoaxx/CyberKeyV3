import React, { createContext, useContext, useState, useEffect } from 'react'
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './auth-context'
import type { UserSettings, SettingsContextType } from '@/types/settings'

const defaultSettings: UserSettings = {
  apiKeyDefaults: {
    expirationDays: 30,
    usageLimit: null,
    allowedDomains: [],
  },
  notifications: {
    emailNotifications: true,
    balanceAlerts: true,
    lowBalanceThreshold: 100,
    keyExpirationWarning: true,
    keyExpirationDays: 7,
  },
  preferences: {
    theme: 'system',
    dateFormat: 'YYYY-MM-DD',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    currency: 'USD',
  },
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setSettings(null)
      setIsLoading(false)
      return
    }

    const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences')
    const unsubscribe = onSnapshot(
      settingsRef,
      (doc) => {
        if (doc.exists()) {
          setSettings(doc.data() as UserSettings)
        } else {
          // Initialize settings document if it doesn't exist
          setDoc(settingsRef, defaultSettings)
          setSettings(defaultSettings)
        }
        setIsLoading(false)
      },
      (err) => {
        setError(err)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user || !settings) return

    try {
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences')
      const updatedSettings = {
        ...settings,
        ...newSettings,
      }
      await updateDoc(settingsRef, updatedSettings)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update settings'))
      throw err
    }
  }

  const resetSettings = async () => {
    if (!user) return

    try {
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences')
      await setDoc(settingsRef, defaultSettings)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reset settings'))
      throw err
    }
  }

  return (
    <SettingsContext.Provider
      value={{ settings, isLoading, error, updateSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
