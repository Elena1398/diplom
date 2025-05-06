<script setup>
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()
const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleLogout = () => {
  auth.logout()
  showDropdown.value = false
  router.push('/login') // или '/' если вы хотите отправить на главную
}
</script>

<template>
  <header class="flex justify-between border-b border-slate-300 px-10 py-8">
    <router-link to="/des"
      ><div class="flex items-center gap-4">
        <a class="text-xl uppercase"
          >Valentina Oplachko
          <p class="text-sm text-slate-400">Кондитерские изделия</p>
        </a>
      </div></router-link
    >
    <nav class="flex items-center">
      <ul class="flex items-center gap-10 gap-15">
        <li class="hover:text-slate-500 cursor-pointer">
          <router-link to="/des">Каталог</router-link>
        </li>
        <li class="hover:text-slate-500 cursor-pointer">
          <router-link to="/aboutThePastryChef">О кондитере</router-link>
        </li>
        <li class="hover:text-slate-500 cursor-pointer">
          <router-link to="/deliveryAndPayment">Доставка и Оплата</router-link>
        </li>
        <!-- <li class="hover:text-slate-500 cursor-pointer">
          <router-link to="/">Торты на заказ</router-link>
        </li> -->

        <router-link to="/favourites"
          ><li class="flex items-center hover:text-slate-500 gap-3 cursor-pointer">
            <img src="../../svg/lik.svg" alt="" />
            Избранное
          </li></router-link
        >
        <!-- Если не авторизован -->
        <li
          v-if="!auth.isAuthenticated"
        >
          <router-link to="/login"  class="flex items-center hover:text-slate-500 gap-3 cursor-pointer">
            <img src="../../svg/person.svg" alt="" />
            Вход
          </router-link>
        </li>

        <!-- Если авторизован -->
        <li v-else class="relative cursor-pointer">
          <div class="flex items-center gap-2" @click="toggleDropdown">
            <img :src="auth.user?.photo || '../../svg/person.svg'" />
            <span>{{ auth.user?.login }}</span>
          </div>

          <ul
            v-if="showDropdown"
            class="absolute top-full mt-2 right-0 bg-white border rounded rounded-xl shadow-md w-48 z-50 font-mono"
          >
            <li class="px-4 py-2 hover:bg-gray-100">
              <router-link to="/profile">Профиль</router-link>
            </li>
            <li class="px-4 py-2 hover:bg-gray-100">
              <router-link to="/change-password">Сменить пароль</router-link>
            </li>
            <li class="px-4 py-2 hover:bg-gray-100">
              <router-link to="">Мои заказы</router-link>
            </li>
            <li class="px-4 py-2 hover:bg-gray-100" @click="handleLogout">Выйти</li>
          </ul>
        </li>

        <router-link to="/basket"
          ><li class="flex items-center hover:text-slate-500 gap-3 cursor-pointer">
            <img src="../../svg/shopping_basket.svg" alt="" />
            Корзина
          </li></router-link
        >
      </ul>
    </nav>
  </header>
</template>
