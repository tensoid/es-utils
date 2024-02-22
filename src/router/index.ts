import { createRouter, createWebHistory } from 'vue-router'
import McCluskeyView from '../views/McCluskeyView.vue'
import HomeView from '../views/HomeView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import BaseConverterView from '../views/BaseConverterView.vue'
import FSMDesignerView from '../views/FSMDesignerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/quine-mcclusky',
      name: 'quine-mcclusky',
      component: McCluskeyView
    },
    {
      path: '/base-converter',
      name: 'base-converter',
      component: BaseConverterView
    },
    {
      path: '/fsm-designer',
      name: 'fsm-designer',
      component: FSMDesignerView
    },
    {
      path: "/:catchAll(.*)",
      name: "NotFound",
      component: NotFoundView,
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   component: () => import('../views/AboutView.vue')
    // }
  ]
})

export default router
