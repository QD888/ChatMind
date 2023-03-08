import { defineStore } from 'pinia'
import type { Alert } from './helper'

export const useAlertStore = defineStore({
  id: 'alert',
  state: (): { alert: Alert | null } => ({
    alert: null,
  }),
  actions: {
    success(message: string) {
      this.alert = { message, type: 'alert-success' }
    },
    error(message: string) {
      this.alert = { message, type: 'alert-danger' }
    },
    clear() {
      this.alert = null
    },
  },
})
