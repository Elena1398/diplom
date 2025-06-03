<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const oldPassword = ref('')
const newPassword = ref('')
const repepassword = ref('')
const auth = useAuthStore()

const passwordMismatchError = computed(() => newPassword.value !== repepassword.value)

const handleChangePassword = async () => {
  if (passwordMismatchError.value) {
    alert('Новые пароли не совпадают')
    return
  }

  try {
    const url =
      auth.user.role === 'admin'
        ? 'http://localhost:8080/apis/admin-change-password'
        : 'http://localhost:8080/apis/change-password'

    const response = await axios.post(
      url,
      {
        userId: auth.user.admin_id || auth.user.cus_id, // admin_id для админа, cus_id для клиента
        oldPassword: oldPassword.value,
        newPassword: newPassword.value
      },
      {
        headers: {
          Authorization: `Bearer ${auth.token}` // если используешь аутентификацию
        }
      }
    )
    alert(response.data.message || 'Пароль успешно изменён!')
  } catch (error) {
    console.error('Ошибка смены пароля:', error)
    alert('Ошибка смены пароля. Проверьте старый пароль.')
  }
}

onMounted(() => {
  auth.loadUserFromLocalStorage() // Загружаем данные пользователя при монтировании компонента
})
</script>

<template>
  <div class="max-w-lg mx-auto p-10 mb-10">
    <h1 class="font-mono text-center font-bold uppercase mb-4 text-xl">Смена пароля</h1>
    <form @submit.prevent="handleChangePassword">
      <div class="mb-6">
        <label class="block font-mono mb-2">Старый пароль:</label>
        <input
          v-model="oldPassword"
          type="password"
          required
          class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400 transition duration-300"
        />
      </div>
      <div class="mb-6">
        <label class="block font-mono mb-2">Новый пароль:</label>
        <input
          v-model="newPassword"
          type="password"
          required
          class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400 transition duration-300"
        />
      </div>
      <div class="mb-6">
        <label class="block font-mono mb-2">Повторите новый пароль:</label>
        <input
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
      <button
        type="submit"
        class="w-full bg-lilac hover:bg-purple-400 text-white py-2 rounded-lg transition"
      >
        Изменить пароль
      </button>
    </form>
  </div>
</template>
