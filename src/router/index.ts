import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { ChatLayout } from '@/views/chat/layout'
import { useAlertStore, useTokenAuthStore } from '@/store'
import { AccountLayout } from '@/views/account/layout'

const routes: RouteRecordRaw[] = [
  {
    path: '/account',
    name: 'Login',
    redirect: '/account/login',
    component: AccountLayout,
    children: [
      { path: 'login', component: () => import('@/views/account/Login.vue') },
      { path: 'register', component: () => import('@/views/account/Register.vue') },
    ],
  },
  {
    path: '/',
    name: 'Root',
    redirect: '/chat',
    component: ChatLayout,
    children: [
      {
        path: '/chat/:uuid?',
        name: 'Chat',
        component: () => import('@/views/chat/index.vue'),
      },
    ],
  },

  {
    path: '/404',
    name: '404',
    component: () => import('@/views/exception/404/index.vue'),
  },

  {
    path: '/500',
    name: '500',
    component: () => import('@/views/exception/500/index.vue'),
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: '/404',
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

// setupPageGuard(router)
router.beforeEach(async (to) => {
  // clear alert on route change
  const alertStore = useAlertStore()
  alertStore.clear()

  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/account', '/account/login', '/account/register']
  const authRequired = !publicPages.includes(to.path)

  console.log('to.path', to.path, 'authRequired', authRequired)
  const authStore = useTokenAuthStore()

  if (authRequired && !authStore.authInfo.token) {
    authStore.returnUrl = to.fullPath
    router.push({ name: 'Login' })
  }
})

export async function setupRouter(app: App) {
  app.use(router)
  await router.isReady()
  console.log('router is ready')
}
