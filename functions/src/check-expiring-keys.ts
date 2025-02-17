import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendNotification } from './fcm';

export const checkExpiringKeys = functions.pubsub
  .schedule('every 12 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    
    // Get keys expiring in the next 3 days
    const threeDaysFromNow = admin.firestore.Timestamp.fromDate(
      new Date(now.toDate().getTime() + 3 * 24 * 60 * 60 * 1000)
    );

    try {
      const expiringKeysSnapshot = await db
        .collection('api_keys')
        .where('expiresAt', '>', now)
        .where('expiresAt', '<=', threeDaysFromNow)
        .get();

      console.log(`Found ${expiringKeysSnapshot.size} keys expiring soon`);

      for (const doc of expiringKeysSnapshot.docs) {
        const key = doc.data();
        const userId = key.userId;

        // Get user's notification settings
        const userSettingsDoc = await db
          .collection('user_settings')
          .doc(userId)
          .get();

        const settings = userSettingsDoc.data();
        if (!settings?.notifications?.emailEnabled) {
          console.log(`Notifications disabled for user ${userId}`);
          continue;
        }

        const daysUntilExpiration = Math.ceil(
          (key.expiresAt.toDate().getTime() - now.toDate().getTime()) / 
          (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiration <= settings.notifications.daysBeforeExpiration) {
          // Send notification
          await sendNotification({
            userId,
            notification: {
              title: 'API Key Expiring Soon',
              body: `Your API key "${key.name}" will expire in ${daysUntilExpiration} days`,
              data: {
                type: 'key_expiring',
                keyId: doc.id,
                daysLeft: daysUntilExpiration.toString(),
                keyName: key.name
              }
            }
          });

          console.log(`Sent expiration notification for key ${doc.id} to user ${userId}`);
        }
      }

      return null;
    } catch (error) {
      console.error('Error checking expiring keys:', error);
      return null;
    }
  }); 