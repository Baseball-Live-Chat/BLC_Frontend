import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import GameDetail from '../views/GameDetail.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import FirebaseRegisterForm from '@/components/auth/FirebaseRegisterForm.vue'
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
  {
    path: '/login',
    name: 'Login',
    component: LoginForm,
    meta: {
      title: '로그인 | BLC',
      requiresGuest: true, // 로그인된 사용자는 접근 불가
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: FirebaseRegisterForm,
    meta: {
      title: '회원가입 | BLC',
      requiresGuest: true,
    },
  },
  { path: '/profile', 
    name: 'Profile', 
    component: ProfileView ,
    meta: { title: '마이페이지 | BLC' }
    ,
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
