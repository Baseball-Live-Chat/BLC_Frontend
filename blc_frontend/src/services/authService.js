// src/services/authService.js
import axios from 'axios'

// 📊 환경별 API URL 설정
const API_BASE_URL =
  (process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080') + '/api'
// 🔧 Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // 세션 쿠키 전송을 위해 필요
  headers: {
    'Content-Type': 'application/json',
  },
})

// 📡 요청 인터셉터
apiClient.interceptors.request.use(
  config => {
    console.log(`🚀 API 요청: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  error => Promise.reject(error)
)

// 📨 응답 인터셉터
apiClient.interceptors.response.use(
  response => {
    console.log(`✅ API 응답: ${response.status} ${response.config.url}`)
    return response
  },
  error => {
    console.error(`❌ API 에러: ${error.response?.status} ${error.config?.url}`)

    // 401 Unauthorized 처리
    if (error.response?.status === 401) {
      // 로그인 페이지로 리다이렉트하는 이벤트 발생
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    return Promise.reject(error)
  }
)

export const authAPI = {
  /**
   * 🔐 로그인
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', {
        username: credentials.username,
        password: credentials.password,
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다.')
    }
  },

  /**
   * 🚪 로그아웃
   */
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout')
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || '로그아웃에 실패했습니다.'
      )
    }
  },

  /**
   * 👤 현재 사용자 정보
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me')
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || '사용자 정보를 가져올 수 없습니다.'
      )
    }
  },
}

export const userAPI = {
  /**
   * ✍️ 회원가입
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/users', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        nickname: userData.nickname,
        profileImageUrl: userData.profileImageUrl || null,
        favoriteTeamId: userData.favoriteTeamId || null,
      })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || '회원가입에 실패했습니다.'
      )
    }
  },

  /**
   * 🔍 중복 확인 API들
   */
  async checkUsername(username) {
    try {
      await apiClient.get('/users/check/username', { params: { username } })
      return true // 사용 가능
    } catch (error) {
      if (error.response?.status === 409) return false // 중복
      throw new Error('아이디 확인 중 오류가 발생했습니다.')
    }
  },

  async checkEmail(email) {
    try {
      await apiClient.get('/users/check/email', { params: { email } })
      return true
    } catch (error) {
      if (error.response?.status === 409) return false
      throw new Error('이메일 확인 중 오류가 발생했습니다.')
    }
  },

  async checkNickname(nickname) {
    try {
      await apiClient.get('/users/check/nickname', { params: { nickname } })
      return true
    } catch (error) {
      if (error.response?.status === 409) return false
      throw new Error('닉네임 확인 중 오류가 발생했습니다.')
    }
  },
}
