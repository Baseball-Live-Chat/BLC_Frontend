<template>
  <div class="container mt-5">
    <div v-if="isLoading" class="d-flex justify-content-center">
      <div class="spinner"></div>
    </div>
    <div v-else class="card fade-in">
      <div class="card-header text-center">
        <h2 class="m-0">내 프로필</h2>
      </div>
      <div class="card-body">
        <p class="mb-2"><strong>사용자명:</strong> {{ user.username }}</p>
        <p class="mb-2"><strong>이메일:</strong> {{ user.email }}</p>
        <p class="mb-2"><strong>닉네임:</strong> {{ user.nickname }}</p>
        <p class="mb-2"><strong>선호 팀:</strong> {{ favoriteTeamName }}</p>
        <p class="mb-0"><strong>가입일:</strong> {{ formattedDate }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isLoading = ref(true)

// API 클라이언트 설정 (환경별 URL, 쿠키 전송 포함)
const API_BASE_URL = (process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080') + '/api'
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

// 팀 ID → 팀명 매핑
const TEAM_MAP = {
  1: '키움 히어로즈',
  2: '두산 베어스',
  3: '롯데 자이언츠',
  4: 'SSG 랜더스',
  5: 'KT 위즈',
  6: '삼성 라이온즈',
  7: 'KIA 타이거즈',
  8: 'NC 다이노스',
  9: 'LG 트윈스',
  10: '한화 이글스',
}

onMounted(async () => {
  try {
    const { data } = await apiClient.get('/auth/me')
    // 스토어에 프로필 데이터 저장
    authStore.username       = data.username
    authStore.email          = data.email
    authStore.nickname       = data.nickname
    authStore.favoriteTeamId = data.favoriteTeamId
    authStore.createdAt      = data.createdAt
  } catch (error) {
    console.error('프로필 로드 실패:', error)
  } finally {
    isLoading.value = false
  }
})

// 반응형 프로필 데이터
const user = computed(() => ({
  username: authStore.username,
  email: authStore.email,
  nickname: authStore.nickname,
  favoriteTeamId: authStore.favoriteTeamId,
  createdAt: authStore.createdAt,
}))

// 선호 팀명 계산
const favoriteTeamName = computed(() =>
  user.value.favoriteTeamId
    ? TEAM_MAP[user.value.favoriteTeamId] || '알 수 없음'
    : '미설정'
)

// 가입일 포맷
const formattedDate = computed(() => {
  if (!user.value.createdAt) return ''
  const date = new Date(user.value.createdAt)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
})
</script>

<style scoped>
/* 애니메이션 */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

/* 카드 스타일 강화 */
.card {
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a5f 100%);
  padding: 1.5rem;
}

.card-header h2 {
  color: #ffffff;
  font-size: 1.75rem;
}

.card-body {
  background: #ffffff;
  padding: 2rem;
}

.card-body p {
  margin-bottom: 1rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
}

.card-body p strong {
  flex: 0 0 100px;
  color: #2c5aa0;
  font-weight: 600;
}

/* 스피너 스타일 보강 */
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2c5aa0;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
