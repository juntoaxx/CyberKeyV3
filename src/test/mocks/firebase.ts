export const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
}

export const mockAuth = {
  currentUser: { uid: 'test-user-id' },
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}

export const mockApp = {
  firestore: () => mockFirestore,
  auth: () => mockAuth,
}

jest.mock('firebase/app', () => ({
  initializeApp: () => mockApp,
  getApps: () => [],
}))

jest.mock('firebase/auth', () => ({
  getAuth: () => mockAuth,
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: () => mockFirestore,
}))
