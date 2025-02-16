import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Create a custom render function that includes providers if needed
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  return {
    user: userEvent.setup(),
    ...render(ui, {
      // Add providers here if needed
      wrapper: ({ children }) => children,
      ...options,
    }),
  }
}

export * from '@testing-library/react'
export { customRender as render }
