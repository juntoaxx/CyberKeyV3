import React from 'react'
import { render } from '@testing-library/react'

// Mock context provider
const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    wrapper: ({ children }) => <SettingsProvider>{children}</SettingsProvider>,
    ...options,
  })

export * from '@testing-library/react'
export { customRender as render }
