import '@testing-library/jest-dom'

// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null
  })),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn()
}))
