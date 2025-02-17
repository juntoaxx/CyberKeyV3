import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

interface SendNotificationData {
  userId: string;
  notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  };
}

export const sendNotification = functions.https.onCall(async (data: SendNotificationData, context) => {
  try {
    // Get user's device tokens
    const tokensSnapshot = await admin.firestore()
      .collection('device_tokens')
      .where('userId', '==', data.userId)
      .get();

    if (tokensSnapshot.empty) {
      console.log('No devices found for user:', data.userId);
      return { success: false, error: 'No devices registered' };
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

    // Prepare notification message
    const message = {
      notification: {
        title: data.notification.title,
        body: data.notification.body,
      },
      data: data.notification.data || {},
      tokens: tokens,
      // Configure Android specific options
      android: {
        priority: 'high' as const,
        notification: {
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          sound: 'default',
          priority: 'max' as const,
          channelId: 'high_importance_channel'
        }
      },
      // Configure Apple specific options
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            'content-available': 1
          }
        }
      }
    };

    // Send the notification
    const response = await admin.messaging().sendMulticast(message);

    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });

      // Remove failed tokens
      const removePromises = failedTokens.map(token => 
        admin.firestore()
          .collection('device_tokens')
          .where('token', '==', token)
          .get()
          .then(snapshot => 
            snapshot.docs.forEach(doc => doc.ref.delete())
          )
      );

      await Promise.all(removePromises);
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}); 