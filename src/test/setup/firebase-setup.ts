import { jest } from '@jest/globals'

// Mock Firebase App
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
}))

// Mock Firestore
const mockCollection = jest.fn()
const mockAddDoc = jest.fn()
const mockQuery = jest.fn()
const mockWhere = jest.fn()
const mockOrderBy = jest.fn()
const mockLimit = jest.fn()
const mockGetDocs = jest.fn()
const mockGetFirestore = jest.fn(() => ({
  collection: mockCollection,
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: mockGetFirestore,
  collection: mockCollection,
  addDoc: mockAddDoc,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  getDocs: mockGetDocs,
}))

// Mock Auth
const mockCurrentUser = { uid: 'test-user' }
const mockGetAuth = jest.fn(() => ({
  currentUser: mockCurrentUser,
}))
const mockSignOut = jest.fn()

jest.mock('firebase/auth', () => ({
  getAuth: mockGetAuth,
  signOut: mockSignOut,
}))

// Mock Firebase Config
jest.mock('@/lib/firebase/firebase-config', () => ({
  db: {},
}))

export {
  mockCollection,
  mockAddDoc,
  mockQuery,
  mockWhere,
  mockOrderBy,
  mockLimit,
  mockGetDocs,
  mockGetFirestore,
  mockCurrentUser,
  mockGetAuth,
  mockSignOut,
}
