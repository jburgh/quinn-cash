import { initializeApp } from 'firebase/app'
import { initializeAuth, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import firebaseConfig from './firebaseConfig'

const app = initializeApp(firebaseConfig)

// Explicit localStorage persistence — survives browser restarts indefinitely,
// more durable than the IndexedDB default in Safari/Firefox with ITP enabled.
export const auth = initializeAuth(app, { persistence: browserLocalPersistence })
export const db = getFirestore(app)
export const storage = getStorage(app)
