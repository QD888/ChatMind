import { ss } from '@/utils/storage'

const LOCAL_NAME = 'SECRET_TOKEN'

export function getToken() {
  return ss.get(LOCAL_NAME)
}

export function setToken(token: string) {
  return ss.set(LOCAL_NAME, token)
}

export function removeToken() {
  return ss.remove(LOCAL_NAME)
}
const AUTH_LOCAL_NAME = 'authStorage'

export interface AuthInfo {
  username: string
  token?: string
}

export interface UserState {
  authInfo: AuthInfo
  returnUrl: string | null
}

export function defaultSetting(): UserState {
  return {
    authInfo: {
      username: 'qidian',
    },
    returnUrl: null,
  }
}

export function getLocalState(): UserState {
  const localSetting: UserState | undefined = ss.get(AUTH_LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: UserState): void {
  ss.set(AUTH_LOCAL_NAME, setting)
}
