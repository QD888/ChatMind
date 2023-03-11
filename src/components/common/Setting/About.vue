<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NSpin } from 'naive-ui'
import { fetchChatConfig } from '@/api'
import pkg from '@/../package.json'

interface ConfigState {
  timeoutMs?: number
  reverseProxy?: string
  apiModel?: string
  socksProxy?: string
}

const loading = ref(false)

const config = ref<ConfigState>()

async function fetchConfig() {
  try {
    loading.value = true
    const { data } = await fetchChatConfig<ConfigState>()
    config.value = data
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<template>
  <NSpin :show="loading">
    <div class="p-4 space-y-4">
      <h2 class="text-xl font-bold">
        Version - {{ pkg.version }}
      </h2>
      <div class="p-2 space-y-2 rounded-md bg-neutral-100 dark:bg-neutral-700">
        <p>
          此项目部分开源于
          <a
            class="text-blue-600 dark:text-blue-500"
            href="https://github.com/qidian99/chatgpt-web"
            target="_blank"
          >
            Github
          </a>
          ，开源部分永久免费且基于 MIT 协议。闭源部分可以通过赞助进行订阅。
        </p>
        <p>
          如果你觉得此项目对你有帮助，请在 Github 帮我点个 Star 或者给予一点赞助，谢谢！
        </p>
      </div>
      <p>{{ $t("setting.api") }}：{{ config?.apiModel ?? '-' }}</p>
      <p>{{ $t("setting.reverseProxy") }}：{{ config?.reverseProxy ?? '-' }}</p>
      <p>{{ $t("setting.timeout") }}：{{ config?.timeoutMs ?? '-' }}</p>
      <p>{{ $t("setting.socks") }}：{{ config?.socksProxy ?? '-' }}</p>
    </div>
  </NSpin>
</template>
