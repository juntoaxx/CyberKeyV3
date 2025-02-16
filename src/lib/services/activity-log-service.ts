import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, DocumentData, Timestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export enum ActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_UPDATED = 'API_KEY_UPDATED',
  API_KEY_DELETED = 'API_KEY_DELETED',
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  SESSION_EXTENDED = 'SESSION_EXTENDED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
}

export interface ActivityLog {
  userId: string
  timestamp: Date
  type: ActivityType
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export interface ActivityLogDocument extends Omit<ActivityLog, 'timestamp'> {
  id: string
  timestamp: Date
}

const COLLECTION_NAME = 'activity_logs'

export const activityLogService = {
  async logActivity(type: ActivityType, details?: Record<string, any>): Promise<void> {
    const auth = getAuth()
    const db = getFirestore()
    const user = auth.currentUser

    if (!user) {
      throw new Error('No authenticated user')
    }

    const log: ActivityLog = {
      userId: user.uid,
      timestamp: new Date(),
      type,
      details,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    }

    try {
      await addDoc(collection(db, COLLECTION_NAME), log)
    } catch (error) {
      console.error('Failed to log activity:', error)
      // Don't throw error to prevent disrupting user flow
    }
  },

  async getRecentActivity(limit = 50): Promise<ActivityLogDocument[]> {
    const auth = getAuth()
    const db = getFirestore()
    const user = auth.currentUser

    if (!user) {
      throw new Error('No authenticated user')
    }

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(limit)
    )

    try {
      console.log('Fetching activity logs...')
      const snapshot = await getDocs(q)
      console.log('Got snapshot, processing docs...')
      return snapshot.docs
        .map(doc => {
          try {
            const data = doc.data()
            console.log('Processing doc data:', data)
            if (!data) {
              console.log('No data found')
              return null
            }

            const timestamp = data.timestamp
            console.log('Timestamp:', timestamp)
            if (!timestamp?.toDate || typeof timestamp.toDate !== 'function') {
              console.log('Invalid timestamp')
              return null
            }

            const date = timestamp.toDate()
            console.log('Converted date:', date)
            if (!(date instanceof Date)) {
              console.log('Not a valid date')
              return null
            }

            const result = {
              id: doc.id,
              userId: data.userId,
              type: data.type as ActivityType,
              timestamp: date,
              details: data.details,
              ipAddress: data.ipAddress,
              userAgent: data.userAgent,
            } as ActivityLogDocument
            console.log('Processed document:', result)
            return result
          } catch (error) {
            console.error('Failed to parse activity log document:', error)
            return null
          }
        })
        .filter((item): item is ActivityLogDocument => item !== null)
    } catch (error) {
      console.error('Failed to fetch activity logs:', error)
      return []
    }
  },
}
