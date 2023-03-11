<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'
import { NaiveProvider } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import { currentUser } from '@/api'
import { useTokenAuthStore } from '@/store'

const { theme, themeOverrides } = useTheme()
const { language } = useLanguage()
const authTokenStore = useTokenAuthStore()
currentUser().then(({ data }) => {
  console.log(data)
  try {
    authTokenStore.updateAuthInfo({
      username: data.id,
    })
  }
  catch (e) {
    console.log('Get current user failed', e)
  }
})
</script>

<template>
  <NConfigProvider
    class="h-full"
    :theme="theme"
    :theme-overrides="themeOverrides"
    :locale="language"
  >
    <NaiveProvider>
      <Alert />
      <RouterView />
    </NaiveProvider>
  </NConfigProvider>
</template>
