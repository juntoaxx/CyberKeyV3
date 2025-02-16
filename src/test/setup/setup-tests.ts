import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
    }
  },
}))

// Mock Intersection Observer
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})
window.IntersectionObserver = mockIntersectionObserver

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock browser APIs
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(''),
  },
})

// Mock auth context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({ user: { uid: 'test-user' } }),
}))

// Mock Date toLocaleDateString
const mockToLocaleDateString = jest.fn(() => '1/1/2024')
class MockDate extends Date {
  constructor(date: any) {
    super(date)
  }
  toLocaleDateString() {
    return mockToLocaleDateString()
  }
}

global.Date = MockDate as DateConstructor

// Mock Intl.NumberFormat
const mockFormat = jest.fn((value) => `$${value.toFixed(2)}`)
const mockNumberFormat = jest.fn(() => ({
  format: mockFormat,
}))

global.Intl = {
  ...global.Intl,
  NumberFormat: mockNumberFormat,
}

// Clean up after all tests
afterAll(() => {
  global.Date = global.originalDate
  global.Intl = global.originalIntl
})
