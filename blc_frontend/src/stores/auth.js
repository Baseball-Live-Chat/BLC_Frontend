// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { firebaseAuthService } from '@/services/firebaseAuthService'

export const useAuthStore = defineStore('auth', () => {
  // 📊 상태 (State)
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  let unsubscribe = null

  // 🧮 계산된 값 (Getters)
  const isAuthenticated = computed(() => !!user.value)
  const userNickname = computed(() => user.value?.displayName || user.value?.email || '익명')
  const userEmail = computed(() => user.value?.email || '')
  const userAvatar = computed(() => user.value?.photoURL || null)
  const userId = computed(() => user.value?.uid || null)

  // ⚡ 액션 (Actions)

  /**
   * 🔐 이메일/비밀번호 로그인
   */
  const loginWithEmail = async (email, password) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await firebaseAuthService.loginWithEmail(email, password)
      // user.value는 onAuthStateChanged에서 자동 설정됩니다
      console.log('✅ Firebase 로그인 성공:', result.user.email)
      return true
    } catch (err) {
      error.value = err.message
      console.error('❌ 로그인 실패:', err.message)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * ✍️ 이메일/비밀번호 회원가입
   */
  const registerWithEmail = async (email, password, displayName) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await firebaseAuthService.registerWithEmail(email, password, displayName)
      // user.value는 onAuthStateChanged에서 자동 설정됩니다
      console.log('✅ Firebase 회원가입 성공:', result.user.email)
      return true
    } catch (err) {
      error.value = err.message
      console.error('❌ 회원가입 실패:', err.message)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 🚪 로그아웃
   */
  const logout = async () => {
    isLoading.value = true
    error.value = null

    try {
      await firebaseAuthService.logout()
      // user.value는 onAuthStateChanged에서 자동으로 null로 설정됩니다
      console.log('✅ Firebase 로그아웃 성공')
      return true
    } catch (err) {
      error.value = err.message
      console.error('❌ 로그아웃 실패:', err.message)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 🔄 프로필 업데이트
   */
  const updateProfile = async (updates) => {
    isLoading.value = true
    error.value = null

    try {
      await firebaseAuthService.updateUserProfile(updates)
      console.log('🔄 프로필 업데이트 완료')
      return true
    } catch (err) {
      error.value = err.message
      console.error('❌ 프로필 업데이트 실패:', err.message)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 🏁 Firebase 인증 상태 리스너 초기화
   */
  const initializeAuth = () => {
    // Firebase 인증 상태 변화 감지
    unsubscribe = firebaseAuthService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // 로그인됨
        user.value = firebaseUser
        console.log('✅ Firebase 사용자 인증됨:', firebaseUser.email)
      } else {
        // 로그아웃됨
        user.value = null
        console.log('ℹ️ Firebase 사용자 로그아웃됨')
      }
      isLoading.value = false
    })
  }

  /**
   * 🧹 에러 초기화
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 🛑 인증 리스너 정리
   */
  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // 컴포넌트 언마운트 시 정리
  onUnmounted(() => {
    cleanup()
  })

  // 🎯 스토어 반환
  return {
    // State
    user,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userNickname,
    userEmail,
    userAvatar,
    userId,

    // Actions
    loginWithEmail,
    registerWithEmail,
    logout,
    updateProfile,
    initializeAuth,
    clearError,
    cleanup,
  }
})
