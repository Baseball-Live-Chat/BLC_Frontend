import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import GameDetail from '../views/GameDetail.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/games/:gameId',
    name: 'GameDetail',
    component: GameDetail,
    props: true,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm,
    meta: {
      title: '로그인 - BLC',
      requiresGuest: true, // 로그인된 사용자는 접근 불가
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterForm,
    meta: {
      title: '회원가입 - BLC',
      requiresGuest: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
