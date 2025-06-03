<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()
const showDropdown = ref(false)
const dropdownRef = ref(null)

const isAdmin = computed(() => auth.user?.role === 'admin')

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  auth.loadUserFromLocalStorage()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const closeDropdown = () => {
  showDropdown.value = false
}

const handleLogout = () => {
  auth.logout()
  showDropdown.value = false
  router.push('/login')
}
</script>

<template>
  <header class="flex justify-between border-b border-slate-300 px-10 py-8">
    <router-link to="/des"
      ><div class="flex items-center">
        <img class="w-32" src="../../public/icons/vo.png" alt="" />
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
        <template v-if="!isAdmin">
          <!-- <li class="hover:text-slate-500 cursor-pointer">
          <router-link to="/aboutThePastryChef">О кондитере</router-link>
        </li> -->
          <li class="hover:text-slate-500 cursor-pointer">
            <router-link to="/deliveryAndPayment">Доставка и Оплата</router-link>
          </li>
          <!-- <li class="hover:text-slate-500 cursor-pointer">
          <router-link to="/">Торты на заказ</router-link>
        </li> -->
          <!-- Только для клиентов -->
          <router-link to="/favourites"
            ><li class="flex items-center hover:text-slate-500 gap-3 cursor-pointer">
              <img src="../../svg/lik.svg" alt="" />
              Избранное
            </li></router-link
          >
        </template>

        <!-- Если не авторизован -->
        <li v-if="!auth.isAuthenticated">
          <router-link
            to="/login"
            class="flex items-center hover:text-slate-500 gap-3 cursor-pointer"
          >
            <img src="../../svg/person.svg" alt="" />
            Вход
          </router-link>
        </li>

        <!-- Если авторизован -->
        <li v-else class="relative cursor-pointer" ref="dropdownRef">
          <div class="flex items-center gap-2" @click="toggleDropdown">
            <img :src="auth.user?.photo || '../../svg/person.svg'" />
            <span>{{ auth.user?.login }}</span>
          </div>

          <ul
            v-if="showDropdown"
            class="absolute top-full mt-2 right-0 bg-white border rounded-xl shadow-md w-48 z-50 font-mono"
          >
            <template v-if="isAdmin">
              <li class="px-4 py-2 hover:bg-gray-100" @click="closeDropdown">
                <router-link to="/profile">Профиль</router-link>
              </li>
              <li class="px-4 py-2 hover:bg-gray-100" @click="closeDropdown">
                <router-link to="/change-password">Сменить пароль</router-link>
              </li>
            </template>
            <template v-else>
              <li class="px-4 py-2 hover:bg-gray-100" @click="closeDropdown">
                <router-link to="/profile">Профиль</router-link>
              </li>
              <li class="px-4 py-2 hover:bg-gray-100" @click="closeDropdown">
                <router-link to="/change-password">Сменить пароль</router-link>
              </li>
              <li class="px-4 py-2 hover:bg-gray-100" @click="closeDropdown">
                <router-link to="/myOrders">Мои заказы</router-link>
              </li>
            </template>
            <li class="px-4 py-2 text-purple-600 hover:bg-gray-100" @click="handleLogout">Выйти</li>
          </ul>
        </li>

        <!-- Только для админа -->
        <li v-if="auth.isAuthenticated && isAdmin" class="hover:text-slate-500 cursor-pointer">
          <router-link
            to="/addDes"
            class="border border-slate-300 rounded-lg px-6 py-2 bg-lilac w-auto size-min text-center font-mono text-white hover:bg-purple-600 active:scale-90 transition"
          >
            + Добавить десерт
          </router-link>
        </li>

        <router-link to="/basket"
          ><li v-if="!isAdmin" class="flex items-center hover:text-slate-500 gap-3 cursor-pointer">
            <img src="../../svg/shopping_basket.svg" alt="" />
            Корзина
          </li></router-link
        >
      </ul>
    </nav>
  </header>
</template>
