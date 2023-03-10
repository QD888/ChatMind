<script setup lang='ts'>
import { NImage } from 'naive-ui'
import qrpay from '@/assets/qrpay.jpg'
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
