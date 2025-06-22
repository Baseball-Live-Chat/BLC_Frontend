// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // 📊 상태 (State)
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // 🧮 계산된 값 (Getters)
  const isAuthenticated = computed(() => !!user.value)
  const userNickname = computed(() => user.value?.nickname || '익명')
  const userFavoriteTeam = computed(() => user.value?.favoriteTeamId || null)
  const userAvatar = computed(() => user.value?.profileImageUrl || null)

  // ⚡ 액션 (Actions)

  /**
   * 🔐 로그인
   */
  const login = async credentials => {
    isLoading.value = true
    error.value = null

    try {
      // 1. 로그인 API 호출
      await authAPI.login(credentials)

      // 2. 사용자 정보 가져오기
      const userData = await authAPI.getCurrentUser()
      user.value = userData

      console.log('✅ 로그인 성공:', userData.nickname)
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
   * 🚪 로그아웃
   */
  const logout = async () => {
    isLoading.value = true
    error.value = null

    try {
      await authAPI.logout()
      user.value = null
      console.log('✅ 로그아웃 성공')
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
   * 🔄 사용자 정보 새로고침
   */
  const refreshUser = async () => {
    if (!isAuthenticated.value) return

    try {
      const userData = await authAPI.getCurrentUser()
      user.value = userData
      console.log('🔄 사용자 정보 새로고침 완료')
    } catch (err) {
      // 인증 만료 시 로그아웃 처리
      if (err.message.includes('인증') || err.message.includes('권한')) {
        user.value = null
      }
      console.error('❌ 사용자 정보 새로고침 실패:', err.message)
    }
  }

  /**
   * 🏁 앱 시작 시 인증 상태 확인
   */
  const checkAuthStatus = async () => {
    try {
      const userData = await authAPI.getCurrentUser()
      user.value = userData
      console.log('✅ 기존 세션 복구:', userData.nickname)
      return true
    } catch (err) {
      user.value = null
      console.log('ℹ️ 로그인되지 않은 상태')
      return false
    }
  }

  /**
   * 🧹 에러 초기화
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 👤 사용자 정보 업데이트
   */
  const updateUser = newUserData => {
    if (user.value) {
      user.value = { ...user.value, ...newUserData }
    }
  }

  // 🎯 스토어 반환
  return {
    // State
    user,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userNickname,
    userFavoriteTeam,
    userAvatar,

    // Actions
    login,
    logout,
    refreshUser,
    checkAuthStatus,
    clearError,
    updateUser,
  }
})
