/**
 * Firebase Authentication 서비스
 * @author HKS
 * @description Firebase Auth를 사용한 사용자 인증 관리
 */
import { 
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from './firebase'

// 인증 오류 메시지 매핑
const AUTH_ERROR_MESSAGES = {
  'auth/user-not-found': '등록되지 않은 이메일입니다.',
  'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
  'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
  'auth/weak-password': '비밀번호는 최소 6자리 이상이어야 합니다.',
  'auth/invalid-email': '유효하지 않은 이메일 형식입니다.',
  'auth/too-many-requests': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
  'auth/network-request-failed': '네트워크 오류가 발생했습니다.',
  'auth/invalid-credential': '로그인 정보가 올바르지 않습니다.',
  'auth/user-disabled': '비활성화된 계정입니다.',
  'auth/operation-not-allowed': '허용되지 않은 작업입니다.'
}

export const firebaseAuthService = {
  /**
   * 🔐 이메일/비밀번호로 로그인
   */
  async loginWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ Firebase 로그인 성공:', userCredential.user.email)
      return {
        user: userCredential.user,
        success: true
      }
    } catch (error) {
      console.error('❌ Firebase 로그인 실패:', error.code, error.message)
      throw new Error(this.getErrorMessage(error.code))
    }
  },

  /**
   * ✍️ 이메일/비밀번호로 회원가입
   */
  async registerWithEmail(email, password, displayName = null) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // 닉네임 설정
      if (displayName) {
        await updateProfile(userCredential.user, { displayName })
      }
      
      console.log('✅ Firebase 회원가입 성공:', userCredential.user.email)
      return {
        user: userCredential.user,
        success: true
      }
    } catch (error) {
      console.error('❌ Firebase 회원가입 실패:', error.code, error.message)
      throw new Error(this.getErrorMessage(error.code))
    }
  },

  /**
   * 🚪 로그아웃
   */
  async logout() {
    try {
      await signOut(auth)
      console.log('✅ Firebase 로그아웃 성공')
      return { success: true }
    } catch (error) {
      console.error('❌ Firebase 로그아웃 실패:', error.message)
      throw new Error('로그아웃에 실패했습니다.')
    }
  },

  /**
   * 👤 현재 사용자 가져오기
   */
  getCurrentUser() {
    return auth.currentUser
  },

  /**
   * 🔄 인증 상태 변화 감지
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback)
  },

  /**
   * 👤 사용자 프로필 업데이트
   */
  async updateUserProfile(updates) {
    try {
      if (!auth.currentUser) {
        throw new Error('로그인된 사용자가 없습니다.')
      }
      
      await updateProfile(auth.currentUser, updates)
      console.log('✅ 프로필 업데이트 성공')
      return { success: true }
    } catch (error) {
      console.error('❌ 프로필 업데이트 실패:', error.message)
      throw new Error('프로필 업데이트에 실패했습니다.')
    }
  },

  /**
   * 🔧 에러 메시지 변환
   * @param {string} errorCode - Firebase 에러 코드
   * @returns {string} 사용자 친화적인 에러 메시지
   */
  getErrorMessage(errorCode) {
    return AUTH_ERROR_MESSAGES[errorCode] || '알 수 없는 오류가 발생했습니다.'
  },

  /**
   * 🔍 사용자 인증 상태 확인
   * @returns {boolean} 인증 여부
   */
  isAuthenticated() {
    return !!auth.currentUser
  },

  /**
   * 📧 현재 사용자 이메일 가져오기
   * @returns {string|null} 사용자 이메일
   */
  getCurrentUserEmail() {
    return auth.currentUser?.email || null
  }
}