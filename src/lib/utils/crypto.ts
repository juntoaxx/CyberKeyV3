import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'your-fallback-key-min-32-chars-long!!!';

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

/**
 * Encrypts data using AES-256-GCM
 */
export const encryptData = (text: string): string => {
  const iv = randomBytes(IV_LENGTH);
  const salt = randomBytes(SALT_LENGTH);
  const key = Buffer.from(ENCRYPTION_KEY);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  
  const result = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]);
  return result.toString('base64');
}

/**
 * Decrypts data using AES-256-GCM
 */
export const decryptData = (encryptedData: string): string => {
  const encrypted = Buffer.from(encryptedData, 'base64');
  const salt = encrypted.slice(0, SALT_LENGTH);
  const iv = encrypted.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = encrypted.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const text = encrypted.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  
  const key = Buffer.from(ENCRYPTION_KEY);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(text.toString('hex'), 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
