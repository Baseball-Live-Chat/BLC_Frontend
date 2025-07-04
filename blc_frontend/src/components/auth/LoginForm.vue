<template>
  <div class="login-container">
    <div class="login-form">
      <!-- 헤더 -->
      <div class="form-header">
        <div class="brand">
          <span class="brand-icon">⚾</span>
          <h1 class="brand-title">BLC</h1>
        </div>
        <p class="form-subtitle">야구 팬들과 함께하는 실시간 소통</p>
      </div>

      <!-- 로그인 폼 -->
      <form @submit.prevent="handleLogin" class="auth-form">
        <!-- 아이디 입력 -->
        <div class="form-group">
          <label for="username" class="form-label">아이디</label>
          <input
            id="username"
            v-model="loginForm.username"
            type="text"
            placeholder="아이디를 입력하세요"
            required
            :disabled="authStore.isLoading"
            class="form-input"
            autocomplete="username"
          />
        </div>

        <!-- 비밀번호 입력 -->
        <div class="form-group">
          <label for="password" class="form-label">비밀번호</label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            required
            :disabled="authStore.isLoading"
            class="form-input"
            autocomplete="current-password"
          />
        </div>

        <!-- 아이디 저장 체크박스 -->
        <div class="form-group">
          <label class="checkbox-container">
            <input
              v-model="rememberUsername"
              type="checkbox"
              class="checkbox-input"
            />
            <span class="checkbox-checkmark"></span>
            <span class="checkbox-label">아이디 저장</span>
          </label>
        </div>

        <!-- 에러 메시지 -->
        <div v-if="authStore.error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ authStore.error }}
        </div>

        <!-- 로그인 버튼 -->
        <button
          type="submit"
          :disabled="authStore.isLoading || !isFormValid"
          class="submit-button"
          :class="{ loading: authStore.isLoading }"
        >
          <span v-if="authStore.isLoading" class="button-loading">
            <span class="spinner"></span>
            로그인 중...
          </span>
          <span v-else> 로그인 </span>
        </button>
      </form>

      <!-- 회원가입 링크 -->
      <div class="form-footer">
        <p class="footer-text">
          아직 계정이 없으신가요?
          <router-link to="/register" class="footer-link">회원가입</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 🏪 스토어 및 라우터
const authStore = useAuthStore()
const router = useRouter()

// 🔑 로컬 스토리지 키
const SAVED_USERNAME_KEY = 'saved_username'
const REMEMBER_USERNAME_KEY = 'remember_username'

// 📝 폼 데이터
const loginForm = ref({
  username: '',
  password: '',
})

// 💾 아이디 저장 체크박스
const rememberUsername = ref(false)

// 🧮 계산된 속성
const isFormValid = computed(() => {
  return loginForm.value.username.trim() && loginForm.value.password.trim()
})

// 💾 아이디 저장 함수
const saveUsername = () => {
  if (rememberUsername.value && loginForm.value.username.trim()) {
    localStorage.setItem(SAVED_USERNAME_KEY, loginForm.value.username.trim())
    localStorage.setItem(REMEMBER_USERNAME_KEY, 'true')
  } else {
    localStorage.removeItem(SAVED_USERNAME_KEY)
    localStorage.removeItem(REMEMBER_USERNAME_KEY)
  }
}

// 📖 저장된 아이디 불러오기
const loadSavedUsername = () => {
  const savedUsername = localStorage.getItem(SAVED_USERNAME_KEY)
  const shouldRemember = localStorage.getItem(REMEMBER_USERNAME_KEY) === 'true'
  
  if (savedUsername && shouldRemember) {
    loginForm.value.username = savedUsername
    rememberUsername.value = true
  }
}

// ⚡ 메서드
const handleLogin = async () => {
  authStore.clearError()

  // 아이디 저장 처리
  saveUsername()

  const success = await authStore.login({
    username: loginForm.value.username.trim(),
    password: loginForm.value.password,
  })

  if (success) {
    // 로그인 성공하면 무조건 메인('/')으로
    await router.push('/')
    // 폼 초기화
    loginForm.value = { username: '', password: '' }
  } else {
    // 로그인 실패 시에도 redirect 파라미터 제거
    await router.replace('/login')
  }
}

// 🎯 라이프사이클
onMounted(() => {
  // 이미 로그인된 경우 홈으로 리다이렉트
  if (authStore.isAuthenticated) {
    router.push('/')
  }

  // 저장된 아이디 불러오기
  loadSavedUsername()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a5f 100%);
  padding: 20px;
}

.login-form {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  padding: 40px;
  animation: slideUp 0.6s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 헤더 */
.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.brand-icon {
  font-size: 32px;
  margin-right: 8px;
}

.brand-title {
  font-size: 28px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0;
  letter-spacing: -1px;
}

.form-subtitle {
  color: #666;
  font-size: 14px;
  margin: 0;
  font-weight: 500;
}

/* 폼 */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #1e3a5f;
  font-size: 14px;
}

.form-input {
  padding: 14px 16px;
  border: 2px solid #e1e8f0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #f8fafc;
}

.form-input:focus {
  outline: none;
  border-color: #2c5aa0;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
}

.form-input:disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 체크박스 */
.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  color: #374151;
  margin-top: 4px;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-checkmark {
  position: relative;
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  margin-right: 8px;
  transition: all 0.2s ease;
}

.checkbox-checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.checkbox-input:checked + .checkbox-checkmark {
  background-color: #2c5aa0;
  border-color: #2c5aa0;
}

.checkbox-input:checked + .checkbox-checkmark::after {
  opacity: 1;
}

.checkbox-label {
  font-weight: 500;
}

/* 에러 메시지 */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #fecaca;
}

.error-icon {
  font-size: 16px;
}

/* 버튼 */
.submit-button {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a5f 100%);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(44, 90, 160, 0.3);
  margin-top: 8px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(44, 90, 160, 0.4);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 푸터 */
.form-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.footer-text {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.footer-link {
  color: #2c5aa0;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #1e3a5f;
  text-decoration: underline;
}

/* 반응형 */
@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }
  
  .login-form {
    padding: 24px;
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .form-input {
    padding: 12px 16px;
    font-size: 16px;
  }
  
  .submit-button {
    padding: 14px 20px;
  }
}
</style>