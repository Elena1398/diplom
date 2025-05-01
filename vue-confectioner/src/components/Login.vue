<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const login = ref('')
const passwords = ref('')
const auth = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:8080/apis/login', {
      login: login.value,
      passwords: passwords.value
    })

    alert('Авторизация успешна!')
    auth.setUser(response.data.cus) // сохраняем пользователя в store
    router.push('/') // редирект на главную
  } catch (error) {
    alert('Ошибка авторизации')
    console.error(error)
  }
}
</script>

<template>
  <div class="mt-20">
    <div class="max-w-lg m-auto p-10">
      <h1 class="font-mono text-center uppercase text-3xl">Вход</h1>

      <form @submit.prevent="handleLogin">
        <div class="mt-10">
          <label class="font-mono" for="login">Имя пользователя:</label>
          <input
            class="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-lilac"
            type="text"
            id="login"
            v-model="login"
            required
          />
        </div>
        <div class="mt-10">
          <label class="font-mono" for="passwords">Пароль:</label>
          <input
            class="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-lilac"
            type="passwords"
            id="passwords"
            v-model="passwords"
            required
          />
        </div>
        <button
          class="border border-slate-300 rounded-lg py-2 px-4 mt-8 bg-lilac text-white font-mono block mx-auto w-32"
          type="submit"
        >
          Войти
        </button> 
      </form>
      <div class="flex justify-self-center items-center mt-6">
          <router-link
            class="font-mono text-center font-bold uppercase m-8 text-xl"
            to="/registration"
            >Регистрация</router-link
          >
          <img src="../../svg/arrow_forward.svg" alt="" />
        </div>
    </div>
  </div>
</template>