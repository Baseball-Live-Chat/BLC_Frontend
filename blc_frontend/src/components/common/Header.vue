<template>
  <header class="app-header">
    <div class="header-container">
      <!-- 🏠 로고 영역 -->
      <div class="header-brand">
        <router-link to="/" class="brand-link">
          <span class="brand-icon">⚾</span>
          <span class="brand-text">BLC</span>
        </router-link>
      </div>

      <!-- 📱 모바일 메뉴 토글 -->
      <button
        class="mobile-menu-toggle"
        @click="toggleMobileMenu"
        :class="{ active: isMobileMenuOpen }"
        aria-label="메뉴 토글"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- 🧭 네비게이션 메뉴 -->
      <nav class="header-nav" :class="{ active: isMobileMenuOpen }">
        <div class="nav-links">
          <!-- <router-link to="/" class="nav-link" @click="closeMobileMenu">
            🏟️ 경기장
          </router-link> 추후 추가 예정-->

          <!-- 로그인된 사용자만 볼 수 있는 메뉴 -->
          <template v-if="authStore.isAuthenticated">
            <!-- <router-link
              to="/my-games"
              class="nav-link"
              @click="closeMobileMenu"
            >
              🎯 내 경기
            </router-link> 추후 추가 예정 -->
          </template>
        </div>

        <!-- 👤 사용자 영역 -->
        <div class="header-user">
          <!-- 로그인된 경우 -->
          <div v-if="authStore.isAuthenticated" class="user-section">
            <div class="user-info" @click="toggleUserMenu">
              <div class="user-avatar">
                <img
                  v-if="authStore.userAvatar"
                  :src="authStore.userAvatar"
                  :alt="authStore.userNickname"
                  class="avatar-image"
                />
                <span v-else class="avatar-placeholder">👤</span>
              </div>
              <span class="user-name">{{ authStore.userNickname }}</span>
              <span class="dropdown-arrow" :class="{ active: isUserMenuOpen }"
                >▼</span
              >
            </div>

            <!-- 사용자 드롭다운 메뉴 -->
            <div v-if="isUserMenuOpen" class="user-dropdown">
              <router-link
                to="/profile"
                class="dropdown-item"
                @click="closeUserMenu"
              >
                👤 프로필
              </router-link>
              <!-- <router-link
                to="/settings"
                class="dropdown-item"
                @click="closeUserMenu"
              >
                ⚙️ 설정
              </router-link> 추후 추가 예정-->
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout-btn" @click="handleLogout">
                로그아웃
              </button>
            </div>
          </div>

          <!-- 로그인되지 않은 경우 -->
          <div v-else class="auth-buttons">
            <router-link
              to="/login"
              class="auth-btn login-btn"
              @click="closeMobileMenu"
            >
              로그인
            </router-link>
            <router-link
              to="/register"
              class="auth-btn register-btn"
              @click="closeMobileMenu"
            >
              회원가입
            </router-link>
          </div>
        </div>
      </nav>
    </div>

    <!-- 모바일 메뉴 배경 오버레이 -->
    <div
      v-if="isMobileMenuOpen"
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 🏪 스토어 및 라우터
const authStore = useAuthStore()
const router = useRouter()

// 📱 메뉴 상태
const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

// ⚡ 메서드
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // 사용자 메뉴도 함께 닫기
  isUserMenuOpen.value = false
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
  closeMobileMenu()
}

const handleLogout = async () => {
  const success = await authStore.logout()

  if (success) {
    closeUserMenu()
    // 메인 페이지로 이동
    await router.push('/')
  }
}

// 🖱️ 외부 클릭 시 메뉴 닫기
const handleClickOutside = event => {
  const userSection = event.target.closest('.user-section')
  if (!userSection) {
    isUserMenuOpen.value = false
  }
}

// ⌨️ ESC 키로 메뉴 닫기
const handleKeydown = event => {
  if (event.key === 'Escape') {
    isMobileMenuOpen.value = false
    isUserMenuOpen.value = false
  }
}

// 🎯 라이프사이클
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

/* 🏠 브랜드 영역 */
.header-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #1e3a5f;
  font-weight: 800;
  font-size: 20px;
  transition: color 0.3s ease;
}

.brand-link:hover {
  color: #2c5aa0;
}

.brand-icon {
  font-size: 28px;
  margin-right: 8px;
}

.brand-text {
  letter-spacing: -1px;
}

/* 📱 모바일 토글 버튼 */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  position: relative;
  z-index: 1001;
}

.mobile-menu-toggle span {
  width: 22px;
  height: 2px;
  background-color: #4a5568;
  margin: 3px 0;
  transition: all 0.3s ease;
  transform-origin: center;
}

.mobile-menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* 🧭 네비게이션 */
.header-nav {
  display: flex;
  align-items: center;
  gap: 40px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  color: #4a5568;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-link:hover {
  color: #2c5aa0;
  background-color: #f8fafc;
}

.nav-link.router-link-active {
  color: #2c5aa0;
  background-color: #ebf4ff;
}

/* 👤 사용자 영역 */
.header-user {
  display: flex;
  align-items: center;
}

/* 인증 버튼 */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auth-btn {
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.login-btn {
  color: #2c5aa0;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}

.login-btn:hover {
  background-color: #ebf4ff;
  border-color: #2c5aa0;
}

.register-btn {
  color: white;
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a5f 100%);
  border: 1px solid transparent;
}

.register-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(44, 90, 160, 0.3);
}

/* 사용자 정보 */
.user-section {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: #f8fafc;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e2e8f0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 16px;
  color: #666;
}

.user-name {
  font-weight: 600;
  color: #1e3a5f;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  color: #718096;
  font-size: 10px;
  transition: transform 0.3s ease;
}

.dropdown-arrow.active {
  transform: rotate(180deg);
}

/* 사용자 드롭다운 */
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 180px;
  z-index: 1002;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  text-decoration: none;
  color: #4a5568;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.dropdown-item:hover {
  background-color: #f8fafc;
}

.dropdown-divider {
  height: 1px;
  background-color: #e2e8f0;
  margin: 4px 0;
}

.logout-btn {
  color: #ef4444;
}

.logout-btn:hover {
  background-color: #fef2f2;
}

/* 모바일 오버레이 */
.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* 📱 모바일 반응형 */
@media (max-width: 768px) {
  .app-header {
    height: 56px;
  }

  .header-container {
    padding: 0 16px;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .mobile-overlay {
    display: block;
  }

  .header-nav {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    flex-direction: column;
    justify-content: flex-start;
    padding: 24px;
    gap: 24px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1000;
    overflow-y: auto;
  }

  .header-nav.active {
    transform: translateX(0);
  }

  .nav-links {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    width: 100%;
  }

  .nav-link {
    padding: 16px;
    text-align: center;
    font-size: 16px;
    border-radius: 12px;
  }

  .header-user {
    width: 100%;
    justify-content: center;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e2e8f0;
  }

  .auth-buttons {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }

  .auth-btn {
    padding: 16px;
    text-align: center;
    font-size: 16px;
  }

  .user-section {
    width: 100%;
  }

  .user-info {
    justify-content: center;
    padding: 16px;
    font-size: 16px;
  }

  .user-dropdown {
    position: static;
    margin-top: 16px;
    box-shadow: none;
    border: 1px solid #e2e8f0;
  }

  .dropdown-item {
    padding: 16px;
    font-size: 16px;
    text-align: center;
  }
}
</style>
