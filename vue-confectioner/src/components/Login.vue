<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/baskets'

const auth = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const login = ref('')
const passwords = ref('')
const showModal = ref(false)      // Управление видимостью модального окна
const errorMessage = ref('')      // Сообщение об ошибке

onMounted(() => {
  auth.loadUserFromLocalStorage()
})

async function syncGuestCartToUser(customersId) {
  const guestBaskets = JSON.parse(localStorage.getItem('baskets') || '[]')
  if (!guestBaskets.length) return

  for (const des_id of guestBaskets) {
    const itemKey = `cart-item-${des_id}`
    const saved = JSON.parse(localStorage.getItem(itemKey) || '{}')
    const weight = saved.weight || 0
    const quantity = saved.quantity || 1
    const price = saved.price || 0

    try {
      await axios.post('http://localhost:8080/apis/basket', {
        desertId: des_id,
        finalWeight: weight,
        sumPriceList: price * quantity,
        quantityDes: quantity,
        customersId
      })
    } catch (error) {
      console.error(`Ошибка при добавлении товара des_id=${des_id} в корзину:`, error)
    }
  }

  localStorage.removeItem('baskets')
  guestBaskets.forEach((des_id) => localStorage.removeItem(`cart-item-${des_id}`))
}

const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:8080/apis/login', {
      login: login.value,
      passwords: passwords.value
    })

    const user = response.data.user
    localStorage.setItem('role', user.role)

    if (user.role === 'admin') {
      localStorage.setItem('adminId', user.admin_id)
      auth.setUser(user)
      router.push('/')
    } else {
      localStorage.setItem('customersId', user.cus_id)
      await syncGuestCartToUser(user.cus_id)
      auth.setUser(user)
      await cartStore.loadCart()
      router.push('/')
    }
  } catch (error) {
    errorMessage.value = 'Неверный логин или пароль. Пожалуйста, попробуйте снова.'
    showModal.value = true
    console.error(error)
  }
}

const closeModal = () => {
  showModal.value = false
}


</script>

<template>
  <div class="py-16 mb-40">
    <div class="bg-white rounded-2xl max-w-lg m-auto p-10">
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

    <!-- Модальное окно ошибки -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-8 rounded-xl max-w-md w-full shadow-lg">
        <h3 class="text-xl font-bold mb-4 flex items-center justify-center text-lilac">
          Ошибка авторизации
        </h3>
        <p class="mb-6 text-center">{{ errorMessage }}</p>
        <div class="flex justify-center gap-4">
          <button
            @click="closeModal"
            class="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
