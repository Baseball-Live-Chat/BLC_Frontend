<template>
  <div class="register-container">
    <div class="register-form">
      <!-- 헤더 -->
      <div class="form-header">
        <div class="brand">
          <span class="brand-icon">⚾</span>
          <h1 class="brand-title">BLC</h1>
        </div>
        <p class="form-subtitle">야구 팬 커뮤니티에 참여하세요!</p>
      </div>

      <!-- 회원가입 폼 -->
      <form @submit.prevent="handleRegister" class="auth-form">
        <!-- 이메일 입력 -->
        <div class="form-group">
          <label for="email" class="form-label">이메일 *</label>
          <input
            id="email"
            v-model="registerForm.email"
            type="email"
            placeholder="이메일을 입력하세요"
            required
            :disabled="authStore.isLoading"
            class="form-input"
            autocomplete="email"
          />
        </div>

        <!-- 닉네임 입력 -->
        <div class="form-group">
          <label for="displayName" class="form-label">닉네임 *</label>
          <input
            id="displayName"
            v-model="registerForm.displayName"
            type="text"
            placeholder="2-10자 한글, 영문, 숫자"
            required
            :disabled="authStore.isLoading"
            class="form-input"
            autocomplete="nickname"
          />
          <div
            v-if="registerForm.displayName && !isDisplayNameValid"
            class="field-message invalid"
          >
            닉네임은 2-10자의 한글, 영문, 숫자만 사용 가능합니다.
          </div>
        </div>

        <!-- 비밀번호 입력 -->
        <div class="form-group">
          <label for="password" class="form-label">비밀번호 *</label>
          <input
            id="password"
            v-model="registerForm.password"
            type="password"
            placeholder="6자 이상"
            required
            :disabled="authStore.isLoading"
            class="form-input"
            autocomplete="new-password"
          />
          <div
            v-if="registerForm.password"
            class="field-message"
            :class="passwordStrength.class"
          >
            {{ passwordStrength.message }}
          </div>
        </div>

        <!-- 비밀번호 확인 -->
        <div class="form-group">
          <label for="passwordConfirm" class="form-label">비밀번호 확인 *</label>
          <input
            id="passwordConfirm"
            v-model="registerForm.passwordConfirm"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            required
            :disabled="authStore.isLoading"
            class="form-input"
            :class="{
              invalid: registerForm.passwordConfirm && !passwordsMatch,
            }"
            autocomplete="new-password"
          />
          <div
            v-if="registerForm.passwordConfirm && !passwordsMatch"
            class="field-message invalid"
          >
            비밀번호가 일치하지 않습니다.
          </div>
        </div>

        <!-- 에러 메시지 -->
        <div v-if="authStore.error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ authStore.error }}
        </div>

        <!-- 회원가입 버튼 -->
        <button
          type="submit"
          :disabled="authStore.isLoading || !isFormValid"
          class="submit-button"
          :class="{ loading: authStore.isLoading }"
        >
          <span v-if="authStore.isLoading" class="button-loading">
            <span class="spinner"></span>
            회원가입 중...
          </span>
          <span v-else>🎯 회원가입</span>
        </button>
      </form>

      <!-- 로그인 링크 -->
      <div class="form-footer">
        <p class="footer-text">
          이미 계정이 있으신가요?
          <router-link to="/login" class="footer-link">로그인</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Firebase 회원가입 폼 컴포넌트
 * @author HKS
 * @description Firebase Authentication을 사용한 이메일/비밀번호 회원가입
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 🏪 스토어 및 라우터
const authStore = useAuthStore()
const router = useRouter()

// 📝 폼 데이터
const registerForm = ref({
  email: '',
  displayName: '',
  password: '',
  passwordConfirm: '',
})

// 🧮 계산된 속성 및 유효성 검사
const isEmailValid = computed(() => {
  const email = registerForm.value.email
  if (!email) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
})

const isDisplayNameValid = computed(() => {
  const displayName = registerForm.value.displayName
  if (!displayName) return true
  return /^[가-힣a-zA-Z0-9]{2,10}$/.test(displayName)
})

const passwordsMatch = computed(() => {
  return registerForm.value.password === registerForm.value.passwordConfirm
})

const passwordStrength = computed(() => {
  const password = registerForm.value.password
  if (!password) return { message: '', class: '' }
  
  if (password.length < 6) {
    return { message: '비밀번호는 최소 6자 이상이어야 합니다.', class: 'invalid' }
  } else if (password.length >= 8 && /(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return { message: '강한 비밀번호입니다.', class: 'valid' }
  } else {
    return { message: '사용 가능한 비밀번호입니다.', class: 'warning' }
  }
})

const isFormValid = computed(() => {
  const { email, displayName, password, passwordConfirm } = registerForm.value
  
  return (
    email.trim() &&
    displayName.trim() &&
    password.trim() &&
    passwordConfirm.trim() &&
    isEmailValid.value &&
    isDisplayNameValid.value &&
    passwordsMatch.value &&
    password.length >= 6
  )
})

// ⚡ 메서드
const handleRegister = async () => {
  authStore.clearError()

  const success = await authStore.registerWithEmail(
    registerForm.value.email.trim(),
    registerForm.value.password,
    registerForm.value.displayName.trim()
  )

  if (success) {
    // 회원가입 성공하면 홈으로
    await router.push('/')
    // 폼 초기화
    registerForm.value = {
      email: '',
      displayName: '',
      password: '',
      passwordConfirm: '',
    }
  }
}

// 🎯 라이프사이클
onMounted(() => {
  // 이미 로그인된 경우 홈으로 리다이렉트
  if (authStore.isAuthenticated) {
    router.push('/')
  }
  
  // Firebase 인증 상태 리스너 초기화
  authStore.initializeAuth()
})
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a5f 100%);
  padding: 20px;
}

.register-form {
  width: 100%;
  max-width: 420px;
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

.form-input.invalid {
  border-color: #dc2626;
  background-color: #fef2f2;
}

/* 필드 메시지 */
.field-message {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
}

.field-message.valid {
  color: #059669;
  background-color: #ecfdf5;
}

.field-message.warning {
  color: #d97706;
  background-color: #fffbeb;
}

.field-message.invalid {
  color: #dc2626;
  background-color: #fef2f2;
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
  .register-container {
    padding: 16px;
  }
  
  .register-form {
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