<script setup lang='ts'>
import { NButton } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { fetchAccountSubscription } from '@/api'
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

onMounted(() => {
  fetchSubscription()
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = (`0${date.getMonth() + 1}`).slice(-2)
  const day = (`0${date.getDate()}`).slice(-2)
  const hours = (`0${date.getHours()}`).slice(-2)
  const minutes = (`0${date.getMinutes()}`).slice(-2)
  const seconds = (`0${date.getSeconds()}`).slice(-2)
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const handlePurchse = () => {

}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <h2 class="text-xl font-bold">
      {{ $t('subscription.title') }}
    </h2>
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('subscription.plan') }}</span>
        <p>
          {{ subscription?.plan ?? '-' }}
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('subscription.start') }}</span>
        <p>
          {{ subscription?.start ? formatDate(subscription?.start) : '-' }}
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('subscription.end') }}</span>
        <p>
          {{ subscription?.end ? formatDate(subscription?.end) : '-' }}
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]"> {{ $t('subscription.used') }}</span>
        <p>
          {{ subscription?.used ?? '-' }}
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]"> {{ $t('subscription.max') }}</span>
        <p>
          {{ subscription?.max ?? '-' }}
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]"> {{ $t('subscription.purchaseTitle') }}</span>
        <NButton size="small" @click="handlePurchse">
          {{ $t('subscription.purchase') }}
        </NButton>
      </div>
    </div>
  </div>
</template>
