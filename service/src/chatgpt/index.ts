import 'isomorphic-fetch'
import type { ChatGPTAPIOptions, ChatMessage, SendMessageOptions, TokenInfo } from '@qidian99/chatgpt'
import { ChatGPTAPI, ChatGPTPool, ChatGPTUnofficialProxyAPI } from '@qidian99/chatgpt'
import { SocksProxyAgent } from 'socks-proxy-agent'
import fetch from 'node-fetch'
import { sendResponse } from '../utils'
import type { ApiModel, ChatContext, ChatGPTUnofficialProxyAPIOptions, ModelConfig } from '../types'
import processEnv from '@/env'

// TODO: usage above credit limit error code
const ErrorCodeMessage: Record<string, string> = {
  401: '[OpenAI] 提供错误的API密钥 | Incorrect API key provided',
  403: '[OpenAI] 服务器拒绝访问，请稍后再试 | Server refused to access, please try again later',
  502: '[OpenAI] 错误的网关 |  Bad Gateway',
  503: '[OpenAI] 服务器繁忙，请稍后再试 | Server is busy, please try again later',
  504: '[OpenAI] 网关超时 | Gateway Time-out',
  500: '[OpenAI] 服务器繁忙，请稍后再试 | Internal Server Error',
}

const timeoutMs: number = !isNaN(+processEnv.TIMEOUT_MS) ? +processEnv.TIMEOUT_MS : 30 * 1000
const deleteTokenOnFail = processEnv.USE_API_POOLING_DELETE_ON_FAIL ?? true
let apiModel: ApiModel

if (!processEnv.OPENAI_API_KEY && !processEnv.OPENAI_ACCESS_TOKEN)
  throw new Error('Missing OPENAI_API_KEY or OPENAI_ACCESS_TOKEN environment variable')

let api: ChatGPTPool | ChatGPTAPI | ChatGPTUnofficialProxyAPI

(async () => {
  // More Info: https://github.com/transitive-bullshit/chatgpt-api

  if (processEnv.OPENAI_API_KEY) {
    const OPENAI_API_MODEL = processEnv.OPENAI_API_MODEL
    const model = (typeof OPENAI_API_MODEL === 'string' && OPENAI_API_MODEL.length > 0)
      ? OPENAI_API_MODEL
      : 'gpt-3.5-turbo'

    const options: ChatGPTAPIOptions = {
      apiKey: processEnv.OPENAI_API_KEY,
      completionParams: { model },
      debug: false,
    }

    if (processEnv.OPENAI_API_BASE_URL && processEnv.OPENAI_API_BASE_URL.trim().length > 0)
      options.apiBaseUrl = processEnv.OPENAI_API_BASE_URL

    if (processEnv.SOCKS_PROXY_HOST && processEnv.SOCKS_PROXY_PORT) {
      const agent = new SocksProxyAgent({
        hostname: processEnv.SOCKS_PROXY_HOST,
        port: processEnv.SOCKS_PROXY_PORT,
      })
      options.fetch = (url, options) => {
        return fetch(url, { agent, ...options })
      }
    }

    if (processEnv.USE_API_KEY_POOLING ?? true) {
      console.log('Using api token pooling')
      api = new ChatGPTPool({ ...options })

      // add initial token into pool
      const size = processEnv.OPENAI_API_KEY_INITIAL_POOL_SIZE ?? 1
      if (size > 1) {
        try {
          for (let i = 2; i <= size; i++) {
            const token = process.env[`OPENAI_API_KEY${i}`]
            addToken(token)
          }
        }
        catch (e) {
          console.log('Error while initializing token pool.', e)
        }
      }
    }
    else { api = new ChatGPTAPI({ ...options }) }
    apiModel = 'ChatGPTAPI'
  }
  else {
    const options: ChatGPTUnofficialProxyAPIOptions = {
      accessToken: processEnv.OPENAI_ACCESS_TOKEN,
      debug: false,
    }

    if (processEnv.SOCKS_PROXY_HOST && processEnv.SOCKS_PROXY_PORT) {
      const agent = new SocksProxyAgent({
        hostname: processEnv.SOCKS_PROXY_HOST,
        port: processEnv.SOCKS_PROXY_PORT,
      })
      options.fetch = (url, options) => {
        return fetch(url, { agent, ...options })
      }
    }

    if (processEnv.API_REVERSE_PROXY)
      options.apiReverseProxyUrl = processEnv.API_REVERSE_PROXY

    api = new ChatGPTUnofficialProxyAPI({ ...options })
    apiModel = 'ChatGPTUnofficialProxyAPI'
  }
})()

async function chatReplyProcess(
  message: string,
  lastContext?: { conversationId?: string; parentMessageId?: string },
  process?: (chat: ChatMessage) => void,
  hooks?: {
    precheck?: (token: number) => boolean
    postProcess?: (token: number) => void
  },
) {
  const {
    precheck,
    postProcess,
  } = hooks ?? {}
  if (!message)
    return sendResponse({ type: 'Fail', message: 'Message is empty' })

  try {
    let options: SendMessageOptions = { timeoutMs }

    if (lastContext) {
      if (apiModel === 'ChatGPTAPI')
        options = { parentMessageId: lastContext.parentMessageId }
      else
        options = { ...lastContext }
    }

    const response = await api.sendMessage(message, {
      ...options,
      preCheckHooks: [precheck],
      onProgress: (partialResponse) => {
        process?.(partialResponse)
      },
      postProcessHooks: [postProcess],
    })

    return sendResponse({ type: 'Success', data: response })
  }
  catch (error: any) {
    const code = error.statusCode
    global.console.log(error)

    console.log(JSON.stringify(error))

    // may need to delete token from pool
    if (code === 401) {
      // get current token
      const currentToken = (api as ChatGPTPool).getCurrentToken()
      if (deleteTokenOnFail && currentToken) {
        console.log('Deleting token on chat failure')
        deleteToken(currentToken.id)
      }
    }

    if (Reflect.has(ErrorCodeMessage, code))
      return sendResponse({ type: 'Fail', message: ErrorCodeMessage[code] })
    return sendResponse({ type: 'Fail', message: error.message ?? 'Please check the back-end console' })
  }
}

async function chatConfig() {
  return sendResponse({
    type: 'Success',
    data: {
      apiModel,
      reverseProxy: processEnv.API_REVERSE_PROXY,
      timeoutMs,
      socksProxy: (processEnv.SOCKS_PROXY_HOST && processEnv.SOCKS_PROXY_PORT) ? (`${processEnv.SOCKS_PROXY_HOST}:${processEnv.SOCKS_PROXY_PORT}`) : '-',
    } as ModelConfig,
  })
}

function addToken(token: string) {
  (api as ChatGPTPool).addToken(token)
}

function deleteToken(id: number): boolean {
  return (api as ChatGPTPool).deleteToken(id)
}
function listTokens(): TokenInfo[] {
  return (api as ChatGPTPool).listTokens()
}

function maskToken(tokenInfo: TokenInfo) {
  const token = tokenInfo.token
  tokenInfo.token = token.replace(/^sk-(.{3}).+(.{3})$/, 'sk-$1****************$2')

  return tokenInfo
}

export type { ChatContext, ChatMessage }

export { chatReplyProcess, chatConfig, addToken, deleteToken, listTokens, maskToken }
