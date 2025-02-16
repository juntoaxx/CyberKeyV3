import React from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ApiKeyDefaults } from '@/components/settings/api-key-defaults'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { Preferences } from '@/components/settings/preferences'
import { useSettings } from '@/contexts/settings-context'

const SettingsPage: React.FC = () => {
  const { settings, isLoading, error } = useSettings()

  if (isLoading) {
    return (
      <DashboardLayout>
        <div data-testid="loading-skeleton" className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-red-500">{error.message}</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="grid gap-6">
          <ApiKeyDefaults />
          <NotificationSettings />
          <Preferences />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default SettingsPage
