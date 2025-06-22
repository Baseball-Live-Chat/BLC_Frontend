import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 🔐 전역 인증 이벤트 리스너 설정
window.addEventListener('auth:unauthorized', () => {
  const { useAuthStore } = require('@/stores/auth')
  const authStore = useAuthStore()

  // 인증 만료 시 로그아웃 처리
  authStore.user = null

  // 로그인 페이지로 리다이렉트
  router.push({
    name: 'Login',
    query: { redirect: router.currentRoute.value.fullPath },
  })
})

app.mount('#app')
