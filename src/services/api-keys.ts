import { collection, addDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp, Timestamp, FirestoreError, orderBy, limit, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ApiKey } from '@/types/api-key';

const COLLECTION = 'api_keys';

export interface CreateApiKeyData {
  name: string;
  key: string;
  providerName: string;
  userId: string;
  fundingLink?: string | null;
  balance?: number;
  expiresAt?: Date;
}

export interface UpdateApiKeyData {
  name?: string;
  key?: string;
  providerName?: string;
  balance?: number;
  fundingLink?: string | null;
  isEnabled?: boolean;
}

export const createApiKey = async (data: CreateApiKeyData) => {
  try {
    // Validate required fields
    if (!data.name) {
      throw new Error('Name is required');
    }
    if (!data.key) {
      throw new Error('API key is required');
    }
    if (!data.providerName) {
      throw new Error('Provider name is required');
    }
    if (!data.userId) {
      throw new Error('User ID is required');
    }

    // Clean and prepare data for Firestore
    const cleanData = {
      name: data.name,
      key: data.key,
      providerName: data.providerName,
      userId: data.userId,
      fundingLink: data.fundingLink || null,
      balance: data.balance || 0,
      expiresAt: data.expiresAt ? Timestamp.fromDate(data.expiresAt) : null,
      isEnabled: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION), cleanData);
    console.log('Created API key with ID:', docRef.id);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error creating API key:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create API key' };
  }
};

export const updateApiKey = async (keyId: string, data: UpdateApiKeyData) => {
  try {
    if (!keyId) {
      throw new Error('API key ID is required');
    }

    const updateData: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (typeof data.name === 'string') {
      if (!data.name) {
        throw new Error('Name cannot be empty');
      }
      updateData.name = data.name;
    }

    if (typeof data.key === 'string') {
      if (!data.key) {
        throw new Error('API key cannot be empty');
      }
      updateData.key = data.key;
    }

    if (typeof data.providerName === 'string') {
      if (!data.providerName) {
        throw new Error('Provider name cannot be empty');
      }
      updateData.providerName = data.providerName;
    }

    if (typeof data.balance === 'number') {
      updateData.balance = data.balance;
    }

    if ('fundingLink' in data) {
      updateData.fundingLink = data.fundingLink || null;
    }

    if (typeof data.isEnabled === 'boolean') {
      updateData.isEnabled = data.isEnabled;
    }

    const docRef = doc(db, COLLECTION, keyId);
    await updateDoc(docRef, updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating API key:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update API key' };
  }
};

export const updateApiKeyBalance = async (keyId: string, balance: number) => {
  try {
    const docRef = doc(db, COLLECTION, keyId);
    await updateDoc(docRef, {
      balance,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating API key balance:', error);
    return { error: 'Failed to update balance' };
  }
};

export const deleteApiKey = async (keyId: string): Promise<void> => {
  try {
    if (!keyId) {
      throw new Error('Key ID is required');
    }
    
    console.log('Initiating key deletion...');
    await deleteDoc(doc(db, COLLECTION, keyId));
    console.log('Key deletion successful');
  } catch (error) {
    console.error('Error deleting API key:', error);
    if (error instanceof FirestoreError) {
      switch (error.code) {
        case 'permission-denied':
          throw new Error('Permission denied. You can only delete your own API keys.');
        case 'not-found':
          throw new Error('API key not found.');
        default:
          throw new Error(`Failed to delete API key: ${error.message}`);
      }
    }
    throw error;
  }
};

export const getUserApiKeys = async (userId: string): Promise<ApiKey[]> => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Fetching API keys...');
    
    // Create a simple query first - just get user's keys
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log(`Query complete. Found ${querySnapshot.size} keys`);
    
    const now = Timestamp.now();
    const keys: ApiKey[] = [];
    const expiredKeyIds: string[] = [];
    
    // Process the documents and identify expired keys
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const key = {
        ...data,
        id: doc.id,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
      } as ApiKey;
      
      // Check if key is expired
      if (key.expiresAt && key.expiresAt.toMillis() <= now.toMillis()) {
        expiredKeyIds.push(doc.id);
      } else {
        keys.push(key);
      }
    });
    
    // Delete expired keys in the background
    if (expiredKeyIds.length > 0) {
      console.log(`Found ${expiredKeyIds.length} expired keys to delete`);
      Promise.all(expiredKeyIds.map(id => 
        deleteDoc(doc(db, COLLECTION, id))
          .then(() => console.log('Expired key deleted'))
          .catch(error => console.error('Failed to delete expired key', error))
      )).catch(error => {
        console.error('Error in background deletion:', error);
      });
    }
    
    console.log(`Returning ${keys.length} active keys`);
    return keys;
  } catch (error) {
    console.error('Error getting API keys:', error);
    if (error instanceof FirestoreError) {
      switch (error.code) {
        case 'permission-denied':
          throw new Error('Permission denied. Please check your authentication.');
        case 'unauthenticated':
          throw new Error('You must be logged in to view API keys.');
        case 'unavailable':
          throw new Error('Service temporarily unavailable. Please try again later.');
        default:
          throw new Error(`Failed to fetch API keys: ${error.message}`);
      }
    }
    throw error;
  }
};

export const deleteExpiredKeys = async (userId: string): Promise<number> => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Checking for expired keys...');
    const now = Timestamp.now();
    
    try {
      const q = query(
        collection(db, COLLECTION),
        where('userId', '==', userId),
        where('expiresAt', '<=', now)
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} expired keys`);
      
      const deletePromises = querySnapshot.docs.map(doc => {
        console.log('Processing expired key deletion');
        return deleteDoc(doc.ref);
      });
      
      await Promise.all(deletePromises);
      return querySnapshot.docs.length;
    } catch (error) {
      // If the index doesn't exist yet, just log it and continue
      if (error instanceof FirestoreError && error.message.includes('requires an index')) {
        console.warn('Index not ready yet, skipping expired keys check');
        return 0;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting expired keys:', error);
    if (error instanceof FirestoreError) {
      switch (error.code) {
        case 'permission-denied':
          throw new Error('Permission denied. Please check your authentication.');
        case 'unavailable':
          throw new Error('Service temporarily unavailable. Please try again later.');
        default:
          // Don't show the index creation URL to the user
          const errorMessage = error.message.split('https://')[0].trim();
          throw new Error(`Failed to delete expired keys: ${errorMessage}`);
      }
    }
    throw error;
  }
};
