// src/stores/auth.js (포인트 기능 추가)
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/authService'
import http from '@/lib/http'

export const useAuthStore = defineStore('auth', () => {
  // 📊 상태 (State)
  const user = ref(null)
  const userPoints = ref(0) // 🆕 사용자 포인트 추가
  const isLoading = ref(false)
  const error = ref(null)

  // 🧮 계산된 값 (Getters)
  const isAuthenticated = computed(() => !!user.value)
  const userNickname = computed(() => user.value?.nickname || '익명')
  const userFavoriteTeam = computed(() => user.value?.favoriteTeamId || null)
  const userAvatar = computed(() => user.value?.profileImageUrl || null)
  const formattedPoints = computed(() => {
    return new Intl.NumberFormat('ko-KR').format(userPoints.value)
  })

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

      // 2. 사용자 정보 가져오기 (포인트 포함)
      const userData = await authAPI.getCurrentUser()
      user.value = userData
      userPoints.value = userData.points || 0 // 🆕 API 응답에서 직접 포인트 추출

      console.log('✅ 로그인 성공:', userData.nickname, `(${formattedPoints.value}P)`)
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
      userPoints.value = 0 // 포인트 초기화
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
   * 💰 사용자 포인트 조회 (fetchUserPoints 간소화)
   */
  const fetchUserPoints = async () => {
    if (!isAuthenticated.value) {
      userPoints.value = 0
      return
    }

    try {
      console.log('💰 사용자 정보 새로고침 (포인트 포함)')
      const userData = await authAPI.getCurrentUser()
      user.value = userData
      userPoints.value = userData.points || 0
      console.log('✅ 포인트 업데이트 성공:', formattedPoints.value + 'P')
    } catch (error) {
      console.error('❌ 사용자 정보 조회 실패:', error)
      // 에러 시 기본값 유지
      if (error.response?.status === 404) {
        userPoints.value = 0
      }
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
      userPoints.value = userData.points || 0 // 🆕 포인트도 함께 업데이트
      
      console.log('🔄 사용자 정보 새로고침 완료')
    } catch (err) {
      // 인증 만료 시 로그아웃 처리
      if (err.message.includes('인증') || err.message.includes('권한')) {
        user.value = null
        userPoints.value = 0
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
      userPoints.value = userData.points || 0 // 🆕 포인트도 함께 설정
      
      console.log('✅ 기존 세션 복구:', userData.nickname, `(${formattedPoints.value}P)`)
      return true
    } catch (err) {
      user.value = null
      userPoints.value = 0
      console.log('ℹ️ 로그인되지 않은 상태')
      return false
    }
  }

  /**
   * 💸 포인트 차감 (베팅 시 사용)
   */
  const subtractPoints = (amount) => {
    if (userPoints.value >= amount) {
      userPoints.value -= amount
      console.log(`💸 포인트 차감: -${amount}P (잔액: ${formattedPoints.value}P)`)
    }
  }

  /**
   * 💰 포인트 추가 (베팅 승리 시 사용)
   */
  const addPoints = (amount) => {
    userPoints.value += amount
    console.log(`💰 포인트 추가: +${amount}P (잔액: ${formattedPoints.value}P)`)
  }

  /**
   * 🔄 포인트 수동 업데이트
   */
  const updatePoints = (newAmount) => {
    userPoints.value = newAmount
    console.log(`🔄 포인트 업데이트: ${formattedPoints.value}P`)
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
    userPoints,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userNickname,
    userFavoriteTeam,
    userAvatar,
    formattedPoints,

    // Actions
    login,
    logout,
    refreshUser,
    checkAuthStatus,
    fetchUserPoints,
    subtractPoints,
    addPoints,
    updatePoints,
    clearError,
    updateUser,
  }
})