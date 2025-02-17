'use client';

import { useAuth } from '@/contexts/auth-context';
import { NotificationSettings } from '@/components/settings/notification-settings';
import { PreferenceSettings } from '@/components/settings/preference-settings';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="space-y-4">
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
        <div className="space-y-6">
          <PreferenceSettings />
          <NotificationSettings />
        </div>
      </main>
    </div>
  );
}
