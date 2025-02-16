const Environment = require('jest-environment-jsdom').default
const { TextEncoder, TextDecoder } = require('util')

class CustomTestEnvironment extends Environment {
  async setup() {
    await super.setup()
    
    // Add TextEncoder and TextDecoder to the global scope
    if (typeof this.global.TextEncoder === 'undefined') {
      this.global.TextEncoder = TextEncoder
      this.global.TextDecoder = TextDecoder
    }

    // Add required browser APIs to the global scope
    if (typeof this.global.ResizeObserver === 'undefined') {
      this.global.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      }))
    }

    if (typeof this.global.IntersectionObserver === 'undefined') {
      this.global.IntersectionObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      }))
    }

    // Mock window.matchMedia
    Object.defineProperty(this.global, 'matchMedia', {
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
  }
}

module.exports = CustomTestEnvironment
