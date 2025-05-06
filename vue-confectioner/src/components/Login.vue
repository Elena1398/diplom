<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

onMounted(() => {
  auth.loadUserFromLocalStorage() // Загружаем данные пользователя при монтировании компонента
})

const router = useRouter()
const login = ref('')
const passwords = ref('')
const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:8080/apis/login', {
      login: login.value,
      passwords: passwords.value
    })

    const user = response.data.cus
    localStorage.setItem('customersId', user.cus_id) // Сохраняем ID в localStorage

    alert('Авторизация успешна!')
    auth.setUser(user) // если используешь pinia
    router.push('/')   // переход на главную
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
            type="password"
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