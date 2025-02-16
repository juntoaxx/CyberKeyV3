import { getFirestore, collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export interface SecurityAlert {
  id: string
  userId: string
  type: string
  timestamp: Date
  activityCount: number
  details: {
    recentActivities: Array<{
      type: string
      timestamp: Date
      ipAddress?: string
    }>
  }
  status: 'new' | 'acknowledged' | 'resolved'
}

export const notificationService = {
  async getSecurityAlerts(status?: SecurityAlert['status']) {
    const auth = getAuth()
    const db = getFirestore()
    const user = auth.currentUser

    if (!user) {
      throw new Error('No authenticated user')
    }

    const alertsQuery = query(
      collection(db, 'security_alerts'),
      where('userId', '==', user.uid),
      ...(status ? [where('status', '==', status)] : []),
      orderBy('timestamp', 'desc'),
      limit(50)
    )

    const snapshot = await getDocs(alertsQuery)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
      details: {
        ...doc.data().details,
        recentActivities: doc.data().details.recentActivities.map((activity: any) => ({
          ...activity,
          timestamp: activity.timestamp.toDate(),
        })),
      },
    })) as SecurityAlert[]
  },

  subscribeToNewAlerts(callback: (alert: SecurityAlert) => void) {
    const auth = getAuth()
    const db = getFirestore()
    const user = auth.currentUser

    if (!user) {
      throw new Error('No authenticated user')
    }

    const alertsQuery = query(
      collection(db, 'security_alerts'),
      where('userId', '==', user.uid),
      where('status', '==', 'new'),
      orderBy('timestamp', 'desc')
    )

    return onSnapshot(alertsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const alert = {
            id: change.doc.id,
            ...change.doc.data(),
            timestamp: change.doc.data().timestamp.toDate(),
            details: {
              ...change.doc.data().details,
              recentActivities: change.doc.data().details.recentActivities.map(
                (activity: any) => ({
                  ...activity,
                  timestamp: activity.timestamp.toDate(),
                })
              ),
            },
          } as SecurityAlert
          callback(alert)
        }
      })
    })
  },

  async updateAlertStatus(alertId: string, status: SecurityAlert['status']) {
    const auth = getAuth()
    const db = getFirestore()
    const user = auth.currentUser

    if (!user) {
      throw new Error('No authenticated user')
    }

    const alertRef = doc(db, 'security_alerts', alertId)
    await setDoc(alertRef, { status }, { merge: true })
  },
}
