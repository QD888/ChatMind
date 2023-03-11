<script setup lang="ts">
import { useTokenAuthStore } from '@/store'
import { router } from '@/router'

// redirect home if already logged in
const tokenAuthStore = useTokenAuthStore()
if (tokenAuthStore.authInfo?.token)
  router.push('/')
</script>

<template>
  <div class="container w-full max-w-none">
    <div class="row">
      <div class="col-sm-8 offset-sm-2 mt-5">
        <router-view />
      </div>
    </div>
  </div>
</template>
