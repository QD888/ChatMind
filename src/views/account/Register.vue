<script setup lang="ts">
import { Field, Form } from 'vee-validate'
import * as Yup from 'yup'

import type { Ref } from 'vue'
import { ref } from 'vue'
import Spinner from './components/Spinner.vue'
import { useTokenAuthStore } from '@/store'
import { signup } from '@/api'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'

const error: Ref<null | string> = ref(null)

const schema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
})

async function onSubmit(values: any) {
  error.value = null
  console.log('submitting login', values)
  const tokenAuthStore = useTokenAuthStore()
  const { username, password } = values
  try {
    const resp = await signup({ username, password })
    if (resp.code === 200) {
      console.log('login success', resp)
      tokenAuthStore.updateAuthInfo({
        username: resp.data.user,
        token: resp.data.token,
      })
    }
  }
  catch (e) {
    // login failed
    console.log('login failed')
    error.value = t('account.loginFailed')
  }
}

const { isMobile } = useBasicLayout()
</script>

<template>
  <section>
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        <img class="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo">
        ChatMind
      </a>
      <div
        class="w-full bg-white rounded-lg dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700"
        :class="!isMobile && 'shadow'"
      >
        <div class="space-y-4 md:space-y-6 sm:p-8">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            {{ $t('account.signinTitle') }}
          </h1>
          <Form v-slot="{ errors, isSubmitting }" class="space-y-4 md:space-y-6" :validation-schema="schema" @submit="onSubmit">
            <div>
              <label for="username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('account.username') }}</label>
              <Field name="username" type="text" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="username" required="true" :class="{ 'is-invalid': errors.firstName }" />
              <div class="text-red-600">
                {{ errors.username }}
              </div>
            </div>
            <div>
              <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $t('account.password') }}</label>
              <Field id="password" type="password" name="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="true" />
              <div class="text-red-600">
                {{ errors.password }}
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input id="remember" aria-describedby="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required="false">
                </div>
                <div class="ml-3 text-sm">
                  <label for="remember" class="text-gray-500 dark:text-gray-300">{{ $t('account.remember') }}</label>
                </div>
              </div>
              <a href="#" class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">{{ $t('account.forgotPass') }}</a>
            </div>
            <div v-if="!!error" class="text-red-600">
              {{ error }}
            </div>
            <button
              class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              :class="error && 'bg-red-500 hover:bg-red-600'"
            >
              <Spinner v-if="isSubmitting" class="absolute" />
              {{ $t('account.signup') }}
            </button>
            <p class="text-sm font-light text-gray-500 dark:text-gray-400">
              {{ $t('common.back') }}
              <router-link to="login" class="btn btn-link">
                <span class="font-semibold text-gray-800 dark:text-gray-300">{{ $t('account.signin') }}</span>
              </router-link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  </section>
</template>
