/**
 * Firebase 초기화 및 설정
 * @author HKS
 * @description Firebase Authentication 서비스 초기화
 */
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

// Firebase 프로젝트 설정
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID
}

// Firebase 설정 유효성 검사
const isFirebaseConfigValid = () => {
  return Object.values(firebaseConfig).every(value => value && value !== 'undefined')
}

// Firebase 초기화
let app
let auth

try {
  if (!isFirebaseConfigValid()) {
    console.warn('⚠️ Firebase 설정이 완전하지 않습니다. 환경변수를 확인해주세요.')
  }
  
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)

  // 개발 환경에서 Auth Emulator 사용 (선택사항)
  if (process.env.NODE_ENV === 'development' && process.env.VUE_APP_USE_AUTH_EMULATOR === 'true') {
    connectAuthEmulator(auth, 'http://localhost:9099')
    console.log('🔧 Firebase Auth Emulator 연결됨')
  }
  
  console.log('✅ Firebase 초기화 완료')
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error)
}

// Firebase Authentication 메서드들을 명시적으로 export
export { 
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
}