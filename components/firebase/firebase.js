import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { deleteObject, getStorage } from "firebase/storage"

// Import Firestore

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: "site-additions-feedback.appspot.com",
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId,
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)

// Initialize Firebase Storage
const storage = getStorage(firebaseApp)

// Initialize Firestore
const db = getFirestore(firebaseApp) // Initialize Firestore

// Export the initialized instances
export { storage, db, deleteObject } // Export Firestore along with Storage
