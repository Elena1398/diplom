<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const oldPassword = ref('')
const newPassword = ref('')
const repepassword = ref('')
const auth = useAuthStore()

const passwordMismatchError = computed(() => newPassword.value !== repepassword.value)

// Для модального окна
const showModal = ref(false)
const modalMessage = ref('')

const closeModal = () => {
  showModal.value = false
}

const handleChangePassword = async () => {
  if (passwordMismatchError.value) {
    modalMessage.value = 'Новые пароли не совпадают'
    showModal.value = true
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
        userId: auth.user.admin_id || auth.user.cus_id,
        oldPassword: oldPassword.value,
        newPassword: newPassword.value
      },
      {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }
    )
    modalMessage.value = response.data.message || 'Пароль успешно изменён!'
    showModal.value = true
  } catch (error) {
    console.error('Ошибка смены пароля:', error)
    modalMessage.value = 'Ошибка смены пароля. Проверьте старый пароль.'
    showModal.value = true
  }
}

onMounted(() => {
  auth.loadUserFromLocalStorage()
})
</script>

<template>
  <div class="bg-amber-200/50 mt-20 rounded-lg py-16 mb-40 max-w-lg mx-auto p-10 mb-10">
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
            repepassword && passwordMismatchError
              ? 'border-red-500 focus:border-red-500'
              : 'border-slate-300 focus:border-purple-400'
          ]"
        />
        <p v-if="repepassword && passwordMismatchError" class="text-red-500 text-sm mt-1 font-mono">
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

    <!-- Модальное окно -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-sm w-full text-center font-mono">
        <p class="mb-6">{{ modalMessage }}</p>
        <button
          @click="closeModal"
          class="bg-lilac text-white px-4 py-2 rounded hover:bg-purple-600 transition"
        >
          ОК
        </button>
      </div>
    </div>
  </div>
</template>
