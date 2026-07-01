import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA27izHBVuwxsR9wggFKfB0YEjHgk3oPCc",
  authDomain: "codepulse-7c184.firebaseapp.com",
  projectId: "codepulse-7c184",
  storageBucket: "codepulse-7c184.firebasestorage.app",
  messagingSenderId: "779043203018",
  appId: "1:779043203018:web:8c9d497fd0e277f0f59133"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)