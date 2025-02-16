import React from 'react'
import { useSettings } from '@/contexts/settings-context'

export const ApiKeyDefaults = () => {
  const { settings, updateSettings } = useSettings()

  const handleExpirationChange = (days: number) => {
    updateSettings({
      apiKeyDefaults: {
        ...settings?.apiKeyDefaults,
        expirationDays: days
      }
    })
  }

  const handleUsageLimitChange = (limit: number | null) => {
    updateSettings({
      apiKeyDefaults: {
        ...settings?.apiKeyDefaults,
        usageLimit: limit
      }
    })
  }

  return (
    <div>
      <div>
        <label htmlFor="expirationDays">Default Expiration (days)</label>
        <input
          id="expirationDays"
          type="number"
          min={1}
          max={365}
          value={settings?.apiKeyDefaults.expirationDays}
          onChange={(e) => handleExpirationChange(Number(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="usageLimit">Usage Limit (optional)</label>
        <input
          id="usageLimit"
          type="number"
          min={0}
          value={settings?.apiKeyDefaults.usageLimit || ''}
          onChange={(e) => handleUsageLimitChange(e.target.value ? Number(e.target.value) : null)}
        />
      </div>
    </div>
  )
}
