import { defineStore } from 'pinia'
import jwt_decode from 'jwt-decode'
import { defaultSetting, getLocalState, getToken, removeToken, setLocalState, setToken } from './helper'
import type { AuthInfo, UserState } from './helper'
import { store } from '@/store'
import { fetchSession } from '@/api'
import { router } from '@/router'
export interface AuthState {
  token: string | undefined
  session: { auth: boolean } | null
}

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    token: getToken(),
    session: null,
  }),

  actions: {
    async getSession() {
      try {
        const { data } = await fetchSession<{ auth: boolean }>()
        this.session = { ...data }
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    setToken(token: string) {
      this.token = token
      setToken(token)
    },

    removeToken() {
      this.token = undefined
      removeToken()
    },
  },
})

export function useAuthStoreWithout() {
  return useAuthStore(store)
}

export const useTokenAuthStore = defineStore('auth-store', {
  state: (): UserState => getLocalState(),
  actions: {
    resetAuthInfo() {
      this.authInfo = { ...defaultSetting().authInfo }
      this.recordState()
    },

    recordState() {
      setLocalState(this.$state)
    },

    updateAuthInfo(authInfo: Partial<AuthInfo>) {
      const { token } = authInfo

      this.authInfo = { ...this.authInfo, ...authInfo }
      // console.log('authInfo', this.authInfo)
      if (token)
        this.reloadRoute()
    },
    logout() {
      this.authInfo = { ...defaultSetting().authInfo }
    },
    async reloadRoute() {
      this.recordState()
      console.log('returning to return url: ', this.returnUrl)
      if (this.returnUrl)
        router.push(this.returnUrl!)
      else
        await router.push({ name: 'Root' })
    },
    checkTokenExpiration() {
      // console.log('Checking expire')
      try {
        const decodedToken: any = jwt_decode(this.authInfo.token!)
        const currentTime = Date.now() / 1000 // Convert to seconds
        // console.log(decodedToken, currentTime)

        if (decodedToken.exp > currentTime)
          return false
      }
      catch (ignored) {}
      // Token has expired
      console.log('Token has expired')
      window.location.href = '/'
      // useAlertStore().error(t(' common.unauthorizedTips '))
      // Redirect to login page or handle token expiration as needed
      // const alertStore = useAlertStore()
      // alertStore.error(t(' common.unauthorizedTips '))

      return true
    },
  },
})
