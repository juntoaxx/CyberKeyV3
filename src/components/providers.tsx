'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { SettingsProvider } from '@/contexts/settings-context';
import { ThemeProvider } from '@/components/theme-provider';
import { NotificationHandler } from '@/components/notification-handler';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ThemeProvider>
          <NotificationHandler />
          {children}
        </ThemeProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
