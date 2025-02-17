'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-context';
import type { UserSettings, SettingsContextType } from '@/types/settings';

const COLLECTION = 'user_settings';

const defaultSettings: UserSettings = {
  notifications: {
    emailEnabled: false,
    browserEnabled: false,
    daysBeforeExpiration: 3,
    balanceAlerts: false,
    lowBalanceThreshold: 10,
    notificationFrequency: 'daily',
    smtpSettings: undefined,
    notificationEmail: undefined,
  },
  preferences: {
    theme: 'system',
    timezone: 'UTC',
    defaultExpirationDays: 30,
  },
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeSettings = async () => {
      if (!user) {
        setSettings(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userSettingsRef = doc(db, COLLECTION, user.uid);
        
        // First, try to get the existing settings
        const docSnap = await getDoc(userSettingsRef);
        
        if (!docSnap.exists()) {
          // If no settings exist, create them with defaults
          await setDoc(userSettingsRef, defaultSettings);
          setSettings(defaultSettings);
        }
        
        // Set up real-time listener
        unsubscribe = onSnapshot(
          userSettingsRef,
          (doc) => {
            if (doc.exists()) {
              setSettings(doc.data() as UserSettings);
              setError(null);
            }
          },
          (err) => {
            console.error('Settings sync error:', err);
            setError(err instanceof Error ? err : new Error('Failed to sync settings'));
          }
        );

        setError(null);
      } catch (err) {
        console.error('Error initializing settings:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize settings'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeSettings();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        console.log('Cleaning up settings listener');
        unsubscribe();
      }
    };
  }, [user]); // Only re-run when user changes

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user || !settings) return;

    try {
      const updatedSettings = {
        ...settings,
        ...newSettings,
      };

      const userSettingsRef = doc(db, COLLECTION, user.uid);
      await setDoc(userSettingsRef, updatedSettings);
      setError(null);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to update settings'));
      throw err;
    }
  };

  const resetSettings = async () => {
    if (!user) return;

    try {
      const userSettingsRef = doc(db, COLLECTION, user.uid);
      await setDoc(userSettingsRef, defaultSettings);
      setError(null);
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to reset settings'));
      throw err;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        error,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
