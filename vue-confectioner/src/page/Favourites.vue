<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Catalog from '@/components/Catalog.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const favorites = ref([])

onMounted(async () => {
  await auth.loadUserFromLocalStorage()

  if (!auth.isAuthenticated) {
    // Гость — получаем избранное из localStorage
    const guestFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')

    if (guestFavorites.length === 0) return

    try {
      const { data } = await axios.get('http://localhost:8080/apis/des')
      favorites.value = data.filter((item) => guestFavorites.includes(item.des_id))
    } catch (error) {
      console.error('Ошибка загрузки избранного для гостя:', error)
    }

  } else {
    // Авторизованный пользователь
    try {
      const customersId = localStorage.getItem('customersId')
      if (!customersId) return

      const { data } = await axios.get(
        `http://localhost:8080/apis/favourites?customersId=${customersId}`
      )
      favorites.value = data
    } catch (err) {
      console.error('Ошибка загрузки избранного пользователя:', err)
    }
  }
})
</script>


<template>
  <div class="p-16">
    <h2 class="text-3xl mb-8 font-mono">Избранное</h2>
    <div v-if="favorites.length === 0" class="flex flex-col items-center text-lg text-gray-600 m-48">
        <img src="../../public/svg/cake.png" alt="cake" class="mb-4" />
        <a class="text-3xl font-mono"  for="username">Закладки отсутствуют</a>
        <p class="font-mono text-slate-400"  for="username">Выбирете себя что-нибудь вкусное для хорошего настроения</p>
    </div>
    <Catalog :items="favorites" is-favorites />
  </div>
</template>

