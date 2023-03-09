<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { NButton, NModal } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useAlertStore } from '@/store'

interface Props {
  visible: boolean
  message?: string
  redirect?: string
}

defineProps<Props>()
const alertStore = useAlertStore()
const router = useRouter()
const { alert } = storeToRefs(alertStore)
</script>

<template>
  <NModal :show="!!alert?.message || visible" style="width: 90%; max-width: 640px">
    <div class="p-10 bg-white rounded dark:bg-slate-800">
      <div class="space-y-4">
        <header class="space-y-2">
          <h2 class="text-2xl font-bold text-center text-slate-800 dark:text-neutral-200">
            401
          </h2>
          <p class="text-base text-center text-slate-500 dark:text-slate-500">
            {{ message || alert?.message }}
          </p>
          <Icon403 class="w-[200px] m-auto" />
        </header>

        <NButton
          v-if="!!alert?.message || message"
          block
          type="primary"
          @click="$event => router.push(redirect ? redirect : '#')"
        >
          {{ $t('common.back') }}
        </NButton>
      </div>
    </div>
  </NModal>
</template>
