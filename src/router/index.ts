import { createRouter, createWebHistory } from 'vue-router'
import McCluskeyView from '../views/McCluskeyView.vue'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/quine-mcclusky',
      name: 'quine-mcclusky',
      component: McCluskeyView
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   component: () => import('../views/AboutView.vue')
    // }
  ]
})

export default router
