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
        <!-- 아이디 입력 -->
        <div class="form-group">
          <label for="username" class="form-label">아이디 *</label>
          <div class="input-wrapper">
            <input
              id="username"
              v-model="registerForm.username"
              type="text"
              placeholder="영문, 숫자 4-20자"
              required
              :disabled="isLoading"
              @blur="checkUsernameAvailability"
              class="form-input"
              :class="getFieldClass('username')"
              autocomplete="username"
            />
            <span v-if="validation.username.status" class="field-status">
              {{ getStatusIcon('username') }}
            </span>
          </div>
          <div
            v-if="validation.username.message"
            class="field-message"
            :class="validation.username.status"
          >
            {{ validation.username.message }}
          </div>
        </div>

        <!-- 이메일 입력 -->
        <div class="form-group">
          <label for="email" class="form-label">이메일 *</label>
          <div class="input-wrapper">
            <input
              id="email"
              v-model="registerForm.email"
              type="email"
              placeholder="example@email.com"
              required
              :disabled="isLoading"
              @blur="checkEmailAvailability"
              class="form-input"
              :class="getFieldClass('email')"
              autocomplete="email"
            />
            <span v-if="validation.email.status" class="field-status">
              {{ getStatusIcon('email') }}
            </span>
          </div>
          <div
            v-if="validation.email.message"
            class="field-message"
            :class="validation.email.status"
          >
            {{ validation.email.message }}
          </div>
        </div>

        <!-- 비밀번호 입력 -->
        <div class="form-group">
          <label for="password" class="form-label">비밀번호 *</label>
          <input
            id="password"
            v-model="registerForm.password"
            type="password"
            placeholder="8자 이상, 영문+숫자 조합"
            required
            :disabled="isLoading"
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
          <label for="passwordConfirm" class="form-label"
            >비밀번호 확인 *</label
          >
          <input
            id="passwordConfirm"
            v-model="registerForm.passwordConfirm"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            required
            :disabled="isLoading"
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

        <!-- 닉네임 입력 -->
        <div class="form-group">
          <label for="nickname" class="form-label">닉네임 *</label>
          <div class="input-wrapper">
            <input
              id="nickname"
              v-model="registerForm.nickname"
              type="text"
              placeholder="2-10자 한글, 영문, 숫자"
              required
              :disabled="isLoading"
              @blur="checkNicknameAvailability"
              class="form-input"
              :class="getFieldClass('nickname')"
            />
            <span v-if="validation.nickname.status" class="field-status">
              {{ getStatusIcon('nickname') }}
            </span>
          </div>
          <div
            v-if="validation.nickname.message"
            class="field-message"
            :class="validation.nickname.status"
          >
            {{ validation.nickname.message }}
          </div>
        </div>

        <!-- 선호팀 선택 -->
        <div class="form-group">
          <label for="favoriteTeam" class="form-label">선호팀 (선택사항)</label>
          <select
            id="favoriteTeam"
            v-model="registerForm.favoriteTeamId"
            :disabled="isLoading"
            class="form-select"
          >
            <option value="">팀을 선택하세요</option>
            <option value="1">LG 트윈스</option>
            <option value="2">KT 위즈</option>
            <option value="3">SSG 랜더스</option>
            <option value="4">NC 다이노스</option>
            <option value="5">두산 베어스</option>
            <option value="6">KIA 타이거즈</option>
            <option value="7">롯데 자이언츠</option>
            <option value="8">삼성 라이온즈</option>
            <option value="9">한화 이글스</option>
            <option value="10">키움 히어로즈</option>
          </select>
        </div>

        <!-- 에러 메시지 -->
        <div v-if="error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ error }}
        </div>

        <!-- 회원가입 버튼 -->
        <button
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="submit-button"
          :class="{ loading: isLoading }"
        >
          <span v-if="isLoading" class="button-loading">
            <span class="spinner"></span>
            가입 중...
          </span>
          <span v-else> 🎯 회원가입 </span>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userAPI } from '@/services/authService'

// 🏪 스토어 및 라우터
const authStore = useAuthStore()
const router = useRouter()

// 📝 폼 데이터
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
  nickname: '',
  favoriteTeamId: '',
})

// 🔄 상태
const isLoading = ref(false)
const error = ref('')

// 🔍 유효성 검사 상태
const validation = ref({
  username: { status: '', message: '' },
  email: { status: '', message: '' },
  nickname: { status: '', message: '' },
})

// 🧮 계산된 속성
const passwordsMatch = computed(() => {
  return registerForm.value.password === registerForm.value.passwordConfirm
})

const passwordStrength = computed(() => {
  const password = registerForm.value.password
  if (!password) return { class: '', message: '' }

  if (password.length < 8) {
    return { class: 'invalid', message: '8자 이상 입력하세요' }
  }

  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)

  if (!hasLetter || !hasNumber) {
    return { class: 'invalid', message: '영문과 숫자를 모두 포함해야 합니다' }
  }

  return { class: 'valid', message: '안전한 비밀번호입니다' }
})

const isFormValid = computed(() => {
  return (
    registerForm.value.username &&
    registerForm.value.email &&
    registerForm.value.password &&
    registerForm.value.passwordConfirm &&
    registerForm.value.nickname &&
    passwordsMatch.value &&
    passwordStrength.value.class === 'valid' &&
    validation.value.username.status === 'valid' &&
    validation.value.email.status === 'valid' &&
    validation.value.nickname.status === 'valid'
  )
})

// ⚡ 메서드
const getFieldClass = field => {
  const status = validation.value[field].status
  return {
    valid: status === 'valid',
    invalid: status === 'invalid',
    checking: status === 'checking',
  }
}

const getStatusIcon = field => {
  const status = validation.value[field].status
  switch (status) {
    case 'checking':
      return '🔄'
    case 'valid':
      return '✅'
    case 'invalid':
      return '❌'
    default:
      return ''
  }
}

const checkUsernameAvailability = async () => {
  const username = registerForm.value.username.trim()

  if (!username) {
    validation.value.username = { status: '', message: '' }
    return
  }

  if (username.length < 4 || username.length > 20) {
    validation.value.username = {
      status: 'invalid',
      message: '4-20자로 입력해주세요',
    }
    return
  }

  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    validation.value.username = {
      status: 'invalid',
      message: '영문과 숫자만 사용 가능합니다',
    }
    return
  }

  try {
    validation.value.username = { status: 'checking', message: '확인 중...' }

    const isAvailable = await userAPI.checkUsername(username)

    if (isAvailable) {
      validation.value.username = {
        status: 'valid',
        message: '사용 가능한 아이디입니다',
      }
    } else {
      validation.value.username = {
        status: 'invalid',
        message: '이미 사용 중인 아이디입니다',
      }
    }
  } catch (err) {
    validation.value.username = {
      status: 'invalid',
      message: '확인 중 오류가 발생했습니다',
    }
  }
}

const checkEmailAvailability = async () => {
  const email = registerForm.value.email.trim()

  if (!email) {
    validation.value.email = { status: '', message: '' }
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    validation.value.email = {
      status: 'invalid',
      message: '올바른 이메일 형식이 아닙니다',
    }
    return
  }

  try {
    validation.value.email = { status: 'checking', message: '확인 중...' }

    const isAvailable = await userAPI.checkEmail(email)

    if (isAvailable) {
      validation.value.email = {
        status: 'valid',
        message: '사용 가능한 이메일입니다',
      }
    } else {
      validation.value.email = {
        status: 'invalid',
        message: '이미 등록된 이메일입니다',
      }
    }
  } catch (err) {
    validation.value.email = {
      status: 'invalid',
      message: '확인 중 오류가 발생했습니다',
    }
  }
}

const checkNicknameAvailability = async () => {
  const nickname = registerForm.value.nickname.trim()

  if (!nickname) {
    validation.value.nickname = { status: '', message: '' }
    return
  }

  if (nickname.length < 2 || nickname.length > 10) {
    validation.value.nickname = {
      status: 'invalid',
      message: '2-10자로 입력해주세요',
    }
    return
  }

  try {
    validation.value.nickname = { status: 'checking', message: '확인 중...' }

    const isAvailable = await userAPI.checkNickname(nickname)

    if (isAvailable) {
      validation.value.nickname = {
        status: 'valid',
        message: '사용 가능한 닉네임입니다',
      }
    } else {
      validation.value.nickname = {
        status: 'invalid',
        message: '이미 사용 중인 닉네임입니다',
      }
    }
  } catch (err) {
    validation.value.nickname = {
      status: 'invalid',
      message: '확인 중 오류가 발생했습니다',
    }
  }
}

const handleRegister = async () => {
  error.value = ''
  isLoading.value = true

  try {
    // 회원가입 데이터 준비
    const userData = {
      username: registerForm.value.username.trim(),
      email: registerForm.value.email.trim(),
      password: registerForm.value.password,
      nickname: registerForm.value.nickname.trim(),
      favoriteTeamId: registerForm.value.favoriteTeamId || null,
    }

    // 회원가입 API 호출
    await userAPI.register(userData)

    // 성공 시 자동 로그인
    const loginSuccess = await authStore.login({
      username: userData.username,
      password: userData.password,
    })

    if (loginSuccess) {
      await router.push('/')
    } else {
      await router.push('/login')
    }
  } catch (err) {
    error.value = err.message
    console.error('❌ 회원가입 실패:', err.message)
  } finally {
    isLoading.value = false
  }
}

// 🎯 라이프사이클
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/')
  }
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
  max-width: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  padding: 40px;
  max-height: 90vh;
  overflow-y: auto;
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
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-weight: 600;
  color: #1e3a5f;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input,
.form-select {
  padding: 14px 16px;
  border: 2px solid #e1e8f0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #f8fafc;
  width: 100%;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #2c5aa0;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
}

.form-input.valid {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.form-input.invalid {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.form-input.checking {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.form-input:disabled,
.form-select:disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
  opacity: 0.7;
}

.field-status {
  position: absolute;
  right: 12px;
  font-size: 16px;
  pointer-events: none;
}

.field-message {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 4px;
  font-weight: 500;
}

.field-message.valid {
  color: #059669;
  background-color: #d1fae5;
}

.field-message.invalid {
  color: #dc2626;
  background-color: #fee2e2;
}

.field-message.checking {
  color: #2563eb;
  background-color: #dbeafe;
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
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(44, 90, 160, 0.3);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
  to {
    transform: rotate(360deg);
  }
}

/* 푸터 */
.form-footer {
  margin-top: 24px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e1e8f0;
}

.footer-text {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.footer-link {
  color: #2c5aa0;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #1e3a5f;
  text-decoration: underline;
}

/* 📱 모바일 반응형 */
@media (max-width: 480px) {
  .register-container {
    padding: 16px;
  }

  .register-form {
    padding: 32px 24px;
  }

  .brand-title {
    font-size: 24px;
  }
}
</style>
