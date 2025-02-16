import { randomBytes } from 'crypto'

/**
 * Generates a secure API key with the format: ck_[32 random bytes in hex]
 * Example: ck_1a2b3c4d5e6f7g8h9i0j...
 */
export const generateSecureKey = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    randomBytes(32, (err, buffer) => {
      if (err) {
        reject(err)
        return
      }
      resolve(`ck_${buffer.toString('hex')}`)
    })
  })
}

/**
 * Validates the format of an API key
 */
export const isValidApiKey = (key: string): boolean => {
  return /^ck_[a-f0-9]{64}$/.test(key)
}

/**
 * Safely compares two strings in constant time to prevent timing attacks
 */
export const safeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
