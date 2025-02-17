'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useSettings } from '@/contexts/settings-context';

export function NotificationHandler() {
  const { user } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    console.log('NotificationHandler: User state changed', user?.uid);
    
    if (!user) {
      console.log('NotificationHandler: No user, cleaning up');
      return;
    }

    // Log notification settings status
    console.log('NotificationHandler: Email notifications enabled:', settings?.notifications.emailEnabled);
    console.log('NotificationHandler: SMTP configured:', !!settings?.notifications.smtpSettings);

    // No cleanup needed for SMTP notifications
    return () => {
      console.log('NotificationHandler: Cleaning up');
    };
  }, [user, settings]);

  return null;
} 