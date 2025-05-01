<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const surname = ref('')
const name = ref('')
const patronymic = ref('')
const birthday = ref('')
const email = ref('')
const login = ref('')
const passwords = ref('')
const repepassword = ref('')
const adress = ref('')

const auth = useAuthStore()
const router = useRouter()

const passwordMismatchError = computed(() => passwords.value !== repepassword.value)
const emailOrPhoneError = computed(() => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))

const handleRegis = async () => {
  if (passwordMismatchError.value) {
    alert('Пароли не совпадают')
    return
  }

  if (emailOrPhoneError.value) {
    alert('Неверный формат email')
    return
  }

  try {
    const userData = {
      surname: surname.value,
      name: name.value,
      patronymic: patronymic.value || null,
      birthday: birthday.value,
      email: email.value,
      login: login.value,
      passwords: passwords.value,
      adress: adress.value
    }

    const response = await axios.post('http://localhost:8080/apis/registration', userData)
    alert('Регистрация успешна!')
    auth.setUser(response.data.cus)
    router.push('/')
  } catch (error) {
    console.error('Ошибка регистрации:', error)
    alert('Ошибка регистрации. Возможно, логин или email уже заняты.')
  }
}
</script>


<template>
  <div class="max-w-lg mx-auto p-10">
    <h1 class="font-mono text-center font-bold uppercase mb-4 text-xl">Регистрация</h1>
    <form @submit.prevent="handleRegis">
      <div class="mb-6">
        <label class="block font-mono mb-2">Фамилия:</label>
        <input
          id="surname"
          v-model="surname"
          type="text"
          required
          class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400 transition duration-300"
        />
      </div>
      <div class="mb-6">
        <label class="block font-mono mb-2">Имя:</label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400 transition duration-300"
        />
      </div>
      <div class="mb-6">
        <label class="block font-mono mb-2">Отчество:</label>
        <input
          id="patronymic"
          v-model="patronymic"
          type="text"
          required
          class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400 transition duration-300"
        />
      </div>
      <div class="mb-6">
        <label class="block font-mono mb-2">Дата рождения:</label>
        <input
          id="birthday"
          v-model="birthday"
          type="date"
          required
          class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400 transition duration-300"
        />
      </div>
      <div class="mb-6">
        <label class="block font-mono mb-2">Email:</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="example@mail.com "
          required
          :class="[
            'w-full p-2 border rounded-lg focus:outline-none transition duration-300',
            emailOrPhoneError
              ? 'border-red-500 focus:border-red-500'
              : 'border-slate-300 focus:border-purple-400'
          ]"
        />
        <p v-if="emailOrPhoneError" class="text-red-500 text-sm mt-1 font-mono">
          Введите корректный email.
        </p>
      </div>
      <div class="mb-6">
        <label class="block font-mono mb-2">Логин:</label>
        <input
          id="login"
          v-model="login"
          type="text"
          required
          class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400 transition duration-300"
        />
      </div>
      <div class="mb-6">
        <label class="block font-mono mb-2">Пароль:</label>
        <input
          id="passwords"
          v-model="passwords"
          type="password"
          required
          class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400 transition duration-300"
        />
      </div>
      <div class="mb-6">
        <label class="block font-mono mb-2">Повторите пароль:</label>
        <input
          id="repepassword"
          v-model="repepassword"
          type="password"
          required
          :class="[
            'w-full p-2 border rounded-lg focus:outline-none transition duration-300',
            passwordMismatchError
              ? 'border-red-500 focus:border-red-500'
              : 'border-slate-300 focus:border-purple-400'
          ]"
        />
        <p v-if="passwordMismatchError" class="text-red-500 text-sm mt-1 font-mono">
          Пароли не совпадают.
        </p>
      </div>

      <div class="mb-6">
        <label class="block font-mono mb-2">Адрес:</label>
        <input
          id="adress"
          v-model="adress"
          type="text"
          required
          class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400 transition duration-300"
        />
      </div>

      <button
        type="submit"
        class="border border-slate-300 rounded-lg py-2 px-4 mt-8 bg-lilac text-white font-mono block mx-auto"
      >
        Зарегистрироваться
      </button>
    </form>
  </div>
</template>
