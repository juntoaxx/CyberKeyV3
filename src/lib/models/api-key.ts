import { Timestamp } from 'firebase/firestore'

export interface ApiKey {
  id: string
  name: string
  key: string
  userId: string
  balance: number
  active: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  lastUsedAt: Timestamp | null
  expiresAt: Timestamp | null
  allowedOrigins: string[]
  rateLimit: {
    requests: number
    duration: number // in seconds
  }
}

export interface CreateApiKeyDTO {
  name: string
  balance: number
  allowedOrigins: string[]
  rateLimit?: {
    requests: number
    duration: number
  }
  expiresAt?: Date
}

export interface UpdateApiKeyDTO {
  name?: string
  balance?: number
  active?: boolean
  allowedOrigins?: string[]
  rateLimit?: {
    requests: number
    duration: number
  }
  expiresAt?: Date | null
}
