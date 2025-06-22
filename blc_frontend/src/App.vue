<template>
  <div id="app">
    <!-- 헤더 (로그인/회원가입 페이지에서는 숨김) -->
    <Header v-if="!hideHeaderRoutes.includes($route.name)" />

    <!-- 메인 콘텐츠 -->
    <main
      class="main-content"
      :class="{ 'no-header': hideHeaderRoutes.includes($route.name) }"
    >
      <!-- 로딩 오버레이 -->
      <div v-if="authStore.isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>로딩 중...</p>
        </div>
      </div>

      <!-- 라우터 뷰 -->
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/common/Header.vue'

// 🏪 스토어
const authStore = useAuthStore()
const route = useRoute()

// 🧮 헤더를 숨길 라우트들
const hideHeaderRoutes = computed(() => ['Login', 'Register'])

// 🎯 앱 시작 시 인증 상태 확인
onMounted(async () => {
  console.log('🚀 BLC 앱 시작')

  try {
    // 기존 세션이 있는지 확인
    await authStore.checkAuthStatus()
    console.log('✅ 인증 상태 확인 완료')
  } catch (error) {
    console.log('ℹ️ 세션 없음 (신규 사용자)')
  }
})
</script>

<style>
/* 🎨 전역 스타일 리셋 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    Arial,
    sans-serif;
  background-color: #f8fafc;
  color: #1a202c;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 📄 메인 콘텐츠 */
.main-content {
  flex: 1;
  padding-top: 64px; /* 헤더 높이만큼 */
  transition: padding-top 0.3s ease;
  min-height: 100vh;
}

.main-content.no-header {
  padding-top: 0;
}

/* 🔄 로딩 오버레이 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  text-align: center;
  color: #4a5568;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #2c5aa0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-spinner p {
  font-size: 14px;
  font-weight: 500;
}

/* 🎯 스크롤바 스타일 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* 🎨 유틸리티 클래스 */
.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-left {
  text-align: left;
}

.hidden {
  display: none !important;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 💨 애니메이션 클래스 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* 📱 모바일 반응형 */
@media (max-width: 768px) {
  .main-content {
    padding-top: 56px; /* 모바일 헤더 높이 */
  }

  html {
    font-size: 14px;
  }
}

/* 🎨 포커스 스타일 */
*:focus {
  outline: 2px solid #2c5aa0;
  outline-offset: 2px;
}

button:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #2c5aa0;
  outline-offset: 2px;
}

/* 🔗 링크 스타일 */
a {
  color: #2c5aa0;
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: #1e3a5f;
}

/* 📝 폼 기본 스타일 */
input,
select,
textarea,
button {
  font-family: inherit;
  font-size: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
