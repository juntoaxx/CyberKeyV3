import React from 'react'
import { useSettings } from '@/contexts/settings-context'

export const Preferences = () => {
  const { settings, updateSettings } = useSettings()

  const handleChange = (key: string, value: string) => {
    updateSettings({
      preferences: {
        ...settings?.preferences,
        [key]: value
      }
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="theme">Theme</label>
        <select
          id="theme"
          value={settings?.preferences.theme}
          onChange={(e) => handleChange('theme', e.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>
      <div>
        <label htmlFor="dateFormat">Date Format</label>
        <select
          id="dateFormat"
          value={settings?.preferences.dateFormat}
          onChange={(e) => handleChange('dateFormat', e.target.value)}
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>
    </div>
  )
}
