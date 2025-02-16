import React from 'react'

interface SettingsSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
        <div className="mt-6 space-y-6">{children}</div>
      </div>
    </div>
  )
}
