import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { encryptData, decryptData } from '@/lib/utils/crypto'

const API_KEYS_COLLECTION = 'api_keys'

interface StoredApiKey {
  id: string
  name: string
  service: string
  key: string
  userId: string
  dateAdded: string
  active: boolean
  credit?: number
  fundingUrl?: string | null
}

interface StoreApiKeyDTO {
  name: string
  service: string
  key: string
  dateAdded: string
  credit?: number
  fundingUrl?: string | null
}

export class ApiKeyService {
  private static instance: ApiKeyService
  private constructor() {}

  static getInstance(): ApiKeyService {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService()
    }
    return ApiKeyService.instance
  }

  async storeApiKey(userId: string, dto: StoreApiKeyDTO): Promise<StoredApiKey> {
    // Encrypt the API key before storing
    const encryptedKey = await encryptData(dto.key)

    const apiKey: Omit<StoredApiKey, 'id'> = {
      userId,
      name: dto.name,
      service: dto.service,
      key: encryptedKey,
      dateAdded: dto.dateAdded,
      active: true,
      credit: dto.credit || null,
      fundingUrl: dto.fundingUrl || null,
    }

    const docRef = await addDoc(collection(db, API_KEYS_COLLECTION), apiKey)
    return {
      id: docRef.id,
      ...apiKey,
    }
  }

  async getApiKeys(userId: string): Promise<StoredApiKey[]> {
    const q = query(
      collection(db, API_KEYS_COLLECTION),
      where('userId', '==', userId)
    )
    
    const snapshot = await getDocs(q)
    const keys: StoredApiKey[] = []

    for (const doc of snapshot.docs) {
      const data = doc.data()
      // Decrypt the API key when retrieving
      const decryptedKey = await decryptData(data.key)
      keys.push({
        id: doc.id,
        ...data,
        key: decryptedKey,
        credit: data.credit || undefined,
        fundingUrl: data.fundingUrl || undefined,
      } as StoredApiKey)
    }

    return keys
  }

  async deleteApiKey(id: string): Promise<void> {
    await deleteDoc(doc(db, API_KEYS_COLLECTION, id))
  }

  async toggleApiKeyStatus(id: string, active: boolean): Promise<void> {
    await updateDoc(doc(db, API_KEYS_COLLECTION, id), { active })
  }
}
