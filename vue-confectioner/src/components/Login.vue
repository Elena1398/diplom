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

onMounted(() => {
  auth.loadUserFromLocalStorage()
})

// Функция, чтобы "поднять" гостевую корзину в корзину пользователя
async function syncGuestCartToUser(customersId) {
  const guestBaskets = JSON.parse(localStorage.getItem('baskets') || '[]')
  if (!guestBaskets.length) return

  // Перебираем все товары из гостевой корзины
  for (const des_id of guestBaskets) {
    const itemKey = `cart-item-${des_id}`
    const saved = JSON.parse(localStorage.getItem(itemKey) || '{}')
    const weight = saved.weight || 0
    const quantity = saved.quantity || 1
    const price = saved.price || 0

    try {
      // Отправляем запрос на сервер для добавления товара в корзину пользователя
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

  // Очистить гостевую корзину из localStorage
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
      alert('Вход администратора успешен!')
      router.push('/')
    } else {
      // Сначала сохраняем customersId, чтобы использовать в синхронизации корзины
      localStorage.setItem('customersId', user.cus_id)

      // Поднимаем гостевую корзину в серверную корзину пользователя
      await syncGuestCartToUser(user.cus_id)

      // После этого устанавливаем пользователя и загружаем корзину из сервера
      auth.setUser(user)
      await cartStore.loadCart()

      alert('Вход пользователя успешен!')
      router.push('/')
    }
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