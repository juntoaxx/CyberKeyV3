// Mock Firebase Auth
export const getAuth = jest.fn(() => ({
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}))

// Mock Firebase Firestore
export const getFirestore = jest.fn()
export const collection = jest.fn()
export const doc = jest.fn()
export const getDoc = jest.fn()
export const getDocs = jest.fn()
export const setDoc = jest.fn()
export const updateDoc = jest.fn()
export const deleteDoc = jest.fn()
export const query = jest.fn()
export const where = jest.fn()
export const orderBy = jest.fn()
export const limit = jest.fn()
export const Timestamp = {
  now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
  fromDate: jest.fn((date) => ({ 
    seconds: Math.floor(date.getTime() / 1000), 
    nanoseconds: 0,
    toDate: () => date,
  })),
}

// Mock Firebase App
export const initializeApp = jest.fn()
export const getApp = jest.fn()
export const getApps = jest.fn(() => [])
