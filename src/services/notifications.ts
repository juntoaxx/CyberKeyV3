import { getFunctions, httpsCallable } from 'firebase/functions';
import { fcmService } from './fcm';

export interface SendNotificationParams {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

class NotificationService {
  async initialize() {
    try {
      const token = await fcmService.requestPermission();
      return !!token;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  async send(params: SendNotificationParams) {
    try {
      const functions = getFunctions();
      const sendNotification = httpsCallable(functions, 'sendNotification');
      
      const result = await sendNotification({
        userId: params.userId,
        notification: {
          title: params.title,
          body: params.body,
          data: params.data
        }
      });
      
      return result.data as { success: boolean; error?: string };
    } catch (error) {
      console.error('Failed to send notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send notification'
      };
    }
  }

  onMessage(callback: (notification: { title: string; body: string; data?: Record<string, string> }) => void) {
    return fcmService.onMessage(callback);
  }
}

export const notificationService = new NotificationService(); 