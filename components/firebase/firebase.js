import { getApp, getApps, initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { deleteObject, getStorage } from "firebase/storage"

import firebaseConfig from "./firebase.config"

// Initialize Fitebase only once
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp()
// Initialize Firebase Storage
const storage = getStorage(firebaseApp)

// Initialize Firestore
const db = getFirestore(firebaseApp) // Initialize Firestore

// Export the initialized instances
export { storage, db, deleteObject } // Export Firestore along with Storage
