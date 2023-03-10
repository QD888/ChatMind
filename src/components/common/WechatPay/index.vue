<script setup lang='ts'>
import { computed } from 'vue'
import { NImage } from 'naive-ui'
import qrpay from '@/assets/qrpay.jpg'
import { useUserStore } from '@/store'
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)
</script>

<template>
  <div class="flex flex-col items-center">
    <NImage
      size="large"
      round
      :src="qrpay"
      :fallback-src="qrpay"
    />
  </div>
</template>
