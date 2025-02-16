import React from 'react'
import { useSettings } from '@/contexts/settings-context'
import { Switch } from '@headlessui/react'

export const NotificationSettings = () => {
  const { settings, updateSettings } = useSettings()

  const handleToggle = (key: string, value: boolean) => {
    updateSettings({
      notifications: {
        ...settings?.notifications,
        [key]: value
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="emailNotifications">Email Notifications</label>
        <Switch
          id="emailNotifications"
          checked={settings?.notifications.emailNotifications}
          onChange={(checked) => handleToggle('emailNotifications', checked)}
        />
      </div>
      <div className="flex items-center justify-between">
        <label htmlFor="balanceAlerts">Balance Alerts</label>
        <Switch
          id="balanceAlerts"
          checked={settings?.notifications.balanceAlerts}
          onChange={(checked) => handleToggle('balanceAlerts', checked)}
        />
      </div>
    </div>
  )
}
