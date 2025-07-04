// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import GameDetail from '../views/GameDetail.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import ProfileView from '@/views/ProfileView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '홈 | BLC' }
  },
  {
    path: '/games/:gameId',
    name: 'GameDetail',
    component: GameDetail,
    props: true,
    meta: { title: '채팅 | BLC' }
  },
  // 🌟 새로 추가: 고정 채팅방 라우트
  {
    path: '/chat/:roomId',
    name: 'GeneralChat',
    component: GameDetail,
    props: route => ({
      gameId: 'general',           // 특별한 식별자
      roomId: route.params.roomId  // 실제 roomId 전달
    }),
    meta: { title: '전체 채팅 | BLC' }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm,
    meta: {
      title: '로그인 | BLC',
      requiresGuest: true,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterForm,
    meta: {
      title: '회원가입 | BLC',
      requiresGuest: true,
    },
  },
  { 
    path: '/profile', 
    name: 'Profile', 
    component: ProfileView,
    meta: { title: '마이페이지 | BLC' },
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'BLC'
  next()
})

export default router