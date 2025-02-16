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
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ApiKey, CreateApiKeyDTO, UpdateApiKeyDTO } from '@/lib/models/api-key'
import { generateSecureKey } from '@/lib/utils/crypto'

const API_KEYS_COLLECTION = 'api_keys'

export class ApiKeyService {
  private static instance: ApiKeyService
  private constructor() {}

  static getInstance(): ApiKeyService {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService()
    }
    return ApiKeyService.instance
  }

  async createApiKey(userId: string, dto: CreateApiKeyDTO): Promise<ApiKey> {
    const key = await generateSecureKey()
    const now = Timestamp.now()

    const apiKey: Omit<ApiKey, 'id'> = {
      key,
      userId,
      name: dto.name,
      balance: dto.balance,
      active: true,
      createdAt: now,
      updatedAt: now,
      lastUsedAt: null,
      expiresAt: dto.expiresAt ? Timestamp.fromDate(dto.expiresAt) : null,
      allowedOrigins: dto.allowedOrigins,
      rateLimit: dto.rateLimit || {
        requests: 100,
        duration: 60, // 1 minute
      },
    }

    const docRef = await addDoc(collection(db, API_KEYS_COLLECTION), apiKey)
    return { ...apiKey, id: docRef.id }
  }

  async getApiKey(id: string): Promise<ApiKey | null> {
    const docRef = doc(db, API_KEYS_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return { id: docSnap.id, ...docSnap.data() } as ApiKey
  }

  async getApiKeyByKey(key: string): Promise<ApiKey | null> {
    const q = query(collection(db, API_KEYS_COLLECTION), where('key', '==', key))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    return { id: doc.id, ...doc.data() } as ApiKey
  }

  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    const q = query(collection(db, API_KEYS_COLLECTION), where('userId', '==', userId))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ApiKey[]
  }

  async updateApiKey(id: string, dto: UpdateApiKeyDTO): Promise<void> {
    const docRef = doc(db, API_KEYS_COLLECTION, id)
    const updates: Partial<ApiKey> = {
      ...dto,
      updatedAt: serverTimestamp() as Timestamp,
    }

    if (dto.expiresAt !== undefined) {
      updates.expiresAt = dto.expiresAt ? Timestamp.fromDate(dto.expiresAt) : null
    }

    await updateDoc(docRef, updates)
  }

  async deleteApiKey(id: string): Promise<void> {
    const docRef = doc(db, API_KEYS_COLLECTION, id)
    await deleteDoc(docRef)
  }

  async updateBalance(id: string, amount: number): Promise<void> {
    const docRef = doc(db, API_KEYS_COLLECTION, id)
    await updateDoc(docRef, {
      balance: amount,
      updatedAt: serverTimestamp(),
    })
  }

  async updateLastUsed(id: string): Promise<void> {
    const docRef = doc(db, API_KEYS_COLLECTION, id)
    await updateDoc(docRef, {
      lastUsedAt: serverTimestamp(),
    })
  }
}
