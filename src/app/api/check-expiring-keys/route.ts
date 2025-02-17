import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { getEmailService } from '@/services/email';
import { ApiKey } from '@/types/api-key';
import { getUserSettings } from '@/services/settings';

export async function GET() {
  try {
    const now = Timestamp.now();
    const threeDaysFromNow = Timestamp.fromDate(
      new Date(now.toDate().getTime() + 3 * 24 * 60 * 60 * 1000)
    );

    // Get all keys that will expire in the next 3 days
    const q = query(
      collection(db, 'api-keys'),
      where('expiresAt', '>', now),
      where('expiresAt', '<=', threeDaysFromNow)
    );

    const querySnapshot = await getDocs(q);
    const emailService = getEmailService();

    if (!emailService) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const notificationPromises = querySnapshot.docs.map(async (doc) => {
      const key = { id: doc.id, ...doc.data() } as ApiKey;
      const userSettings = await getUserSettings(key.userId);

      if (!userSettings?.notifications.emailEnabled || !userSettings.notifications.smtpSettings) {
        return;
      }

      const daysUntilExpiration = Math.ceil(
        (key.expiresAt!.toDate().getTime() - now.toDate().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiration <= userSettings.notifications.daysBeforeExpiration) {
        const user = await db.collection('users').doc(key.userId).get();
        if (user.exists) {
          await emailService.sendExpirationNotification(
            user.data()!.email,
            key,
            daysUntilExpiration
          );
        }
      }
    });

    await Promise.all(notificationPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error checking expiring keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
