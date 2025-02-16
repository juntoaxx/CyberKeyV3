import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'

// Mock router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  reload: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}

// Initialize useRouter mock
;(useRouter as jest.Mock).mockReturnValue(mockRouter)

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  return {
    user: userEvent.setup(),
    ...render(ui, { ...options }),
    mockRouter,
  }
}

export * from '@testing-library/react'
export { customRender as render }
export { mockRouter }
