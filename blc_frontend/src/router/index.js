import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import GameDetail from '../views/GameDetail.vue'

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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
