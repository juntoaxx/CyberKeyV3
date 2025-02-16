import { TestEnvironment } from 'jest-environment-jsdom'

export default class CustomTestEnvironment extends TestEnvironment {
  async setup() {
    await super.setup()
    
    // Mock navigator
    if (typeof this.global.navigator !== 'object') {
      this.global.navigator = {
        userAgent: 'test-user-agent',
      }
    }
  }
}
