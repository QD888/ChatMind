import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { post } from '@/utils/request'
import { useTokenAuthStore } from '@/store'

const authStore = useTokenAuthStore()
const withAuth = (request: any) => {
  if (authStore.authInfo.token)
    return { ...request, headers: { Authorization: `Bearer ${authStore.authInfo.token}`, ...request.headers } }

  console.log('No auth token found')
  return request
}
export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>(withAuth({
    url: '/chat',
    data: { prompt, options },
    signal,
  }))
}

export function fetchChatConfig<T = any>() {
  return post<T>(withAuth({
    url: '/config',
  }))
}

export function fetchChatAPIProcess<T = any>(
  params: {
    prompt: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void },
) {
  return post<T>(withAuth({
    url: '/chat-process',
    data: { prompt: params.prompt, options: params.options },
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  }))
}

export function login({ username, password }: { username: string; password: string }) {
  return post({
    url: '/login',
    data: { username, password },
  })
}

export function fetchSession<T>() {
  return post<T>({
    url: '/session',
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/verify',
    data: { token },
  })
}
