<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { NButton, NInput } from 'naive-ui'
import WechatPay from '../WechatPay/index.vue'
import { fetchAccountSubscription, submitOrder } from '@/api'
import { useAlertStore } from '@/store'

interface SubscriptionState {
  id?: string
  plan?: string
  start?: Date
  end?: Date
  used?: number
  max?: number
  orders?: Array<string>
  previous?: string
}

const loading = ref(false)
const alertStore = useAlertStore()
const subscription = ref<SubscriptionState>()

async function fetchSubscription() {
  try {
    loading.value = true
    const { data } = await fetchAccountSubscription<SubscriptionState>()
    subscription.value = data
    console.log('subscription', data)
  }
  finally {
    loading.value = false
  }
}
const submitted = ref(false)
const timeLeft = ref(120)

onMounted(() => {
  fetchSubscription()
})
const amount = ref(0.01)

const minutes = computed(() => Math.floor(timeLeft.value / 60)
  .toString()
  .padStart(2, '0'))
const seconds = computed(() => Math.floor(timeLeft.value % 60).toString().padStart(2, '0'))

const startCountdown = () => {
  setInterval(() => {
    if (timeLeft.value > 0)
      timeLeft.value--
  }, 1000)
}
const handlePurchse = async (inputAmount: any) => {
  try {
    const order = await submitOrder({ amount: inputAmount })
    console.log(order)
    const {
      data: {
        actualAmount,
        createdAt,
      },
    } = order

    amount.value = +actualAmount
    timeLeft.value = 120 - (Date.now() - Date.parse(createdAt)) / 1000
    startCountdown()
  }
  catch (e: any) {
    console.log(e)
    alertStore.error(e.getMessage())
  }
  submitted.value = true
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div v-if="!submitted" class="ml-2 space-y-6">
      <h2 class="font-bold text-md">
        {{ '赞助1元赠送10000 tokens，请输入金额（最少0.01）' }}
      </h2>
      <div class="flex-1">
        <NInput v-model:value="amount" placeholder="" />
      </div>
      <NButton size="small" @click="handlePurchse(amount)">
        {{ '提交' }}
      </NButton>
    </div>
    <div v-else class="ml-2 space-y-6">
      <h2 class="font-bold text-md">
        实际赞赏{{ amount }}元，获得{{ Math.floor(amount * 10000) }} tokens， 并在 {{ minutes }}:{{ seconds }} 内完成操作
      </h2>
    </div>
    <WechatPay v-if="submitted" />
  </div>
</template>
