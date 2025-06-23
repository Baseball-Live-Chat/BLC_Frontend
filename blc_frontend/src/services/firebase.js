// src/services/firebase.js
import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID
}

// Firebase 초기화
const app = initializeApp(firebaseConfig)

// Auth 인스턴스
const auth = getAuth(app)

// 개발 환경에서 Auth Emulator 사용 (선택사항)
if (process.env.NODE_ENV === 'development' && process.env.VUE_APP_USE_AUTH_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099')
}

export { auth }
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
}