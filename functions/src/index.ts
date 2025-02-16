import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

interface ActivityLog {
  userId: string
  timestamp: Date
  type: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

// Enhance activity logs with IP address
export const onActivityLogCreated = functions.firestore
  .document('activity_logs/{logId}')
  .onCreate(async (snap, context) => {
    const log = snap.data() as ActivityLog
    const metadata = context.rawRequest?.metadata

    if (!metadata) {
      return null
    }

    // Extract IP address from the request metadata
    const ipAddress = metadata.headers['x-forwarded-for'] || metadata.headers['x-real-ip']

    // Update the activity log with the IP address
    if (ipAddress) {
      try {
        await snap.ref.update({
          ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        })
      } catch (error) {
        console.error('Failed to update activity log with IP address:', error)
      }
    }

    return null
  })

// Clean up old activity logs (older than 90 days)
export const cleanupOldActivityLogs = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 90)

    const db = admin.firestore()
    const snapshot = await db
      .collection('activity_logs')
      .where('timestamp', '<', cutoff)
      .get()

    const batch = db.batch()
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
    console.log(`Deleted ${snapshot.size} old activity logs`)
    return null
  })

// Monitor for suspicious activity
export const monitorSuspiciousActivity = functions.firestore
  .document('activity_logs/{logId}')
  .onCreate(async (snap, context) => {
    const log = snap.data() as ActivityLog
    const db = admin.firestore()

    // Get recent activity for the user
    const recentActivity = await db
      .collection('activity_logs')
      .where('userId', '==', log.userId)
      .where('timestamp', '>', new Date(Date.now() - 5 * 60 * 1000)) // Last 5 minutes
      .get()

    // Check for suspicious patterns
    const suspiciousPatterns = [
      {
        type: 'RAPID_API_KEY_CREATION',
        threshold: 5,
        activities: ['API_KEY_CREATED'],
        severity: 'high',
      },
      {
        type: 'MULTIPLE_LOGIN_ATTEMPTS',
        threshold: 10,
        activities: ['LOGIN'],
        severity: 'high',
      },
      {
        type: 'RAPID_SETTING_CHANGES',
        threshold: 8,
        activities: ['SETTINGS_UPDATED'],
        severity: 'medium',
      },
    ]

    for (const pattern of suspiciousPatterns) {
      const matchingActivities = recentActivity.docs.filter((doc) =>
        pattern.activities.includes(doc.data().type)
      )

      if (matchingActivities.length >= pattern.threshold) {
        // Get user email
        const user = await admin.auth().getUser(log.userId)
        const userEmail = user.email

        // Create security alert
        const alertRef = await db.collection('security_alerts').add({
          userId: log.userId,
          type: pattern.type,
          severity: pattern.severity,
          timestamp: new Date(),
          activityCount: matchingActivities.length,
          status: 'new',
          details: {
            recentActivities: matchingActivities.map((doc) => ({
              type: doc.data().type,
              timestamp: doc.data().timestamp,
              ipAddress: doc.data().ipAddress,
            })),
          },
        })

        // Send email notification if user has email
        if (userEmail) {
          const { sendEmail, getSecurityAlertEmailTemplate } = require('./email-service')
          const emailContent = getSecurityAlertEmailTemplate({
            type: pattern.type,
            severity: pattern.severity,
            details: {
              recentActivities: matchingActivities.map((doc) => ({
                type: doc.data().type,
                timestamp: doc.data().timestamp,
                ipAddress: doc.data().ipAddress,
              })),
            },
          })

          await sendEmail({
            to: userEmail,
            subject: `CyberKey Security Alert: ${pattern.type}`,
            html: emailContent,
          })
        }

        // Log the alert creation
        console.log(`Created security alert ${alertRef.id} for user ${log.userId}`)
      }
    }

    return null
  })
