<script setup>
import { onMounted, computed } from 'vue'
import Catalog from '@/components/Catalog.vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useCartStore } from '@/stores/baskets'

// Сторы
const BasStore = useCartStore()

const favStore = useFavoritesStore()

const hasFavorites = computed(() => {
  return favStore.favorites.length > 0
})

onMounted(async () => {
  await favStore.loadFavorites()
  await BasStore.loadCart()

  favStore.favorites = favStore.favorites.map(fav => {
    const inCart = BasStore.baskets.find(b => b.des_id === fav.des_id)
    return {
      ...fav,
      isAdded: !!inCart,
      basketId: inCart?.basketId || null
    }
  })
})


</script>

<template>
  <div class="p-16">
    <h2 class="text-3xl mb-8 font-mono">Избранное</h2>

    <div
      v-if="!hasFavorites"
      class="flex flex-col items-center text-lg text-gray-600 m-48"
    >
      <img src="../../public/icons/cake.png" alt="cake" class="mb-4" />
      <a class="text-3xl font-mono">Закладки отсутствуют</a>
      <p class="font-mono text-slate-400">Выберите что-нибудь вкусное для хорошего настроения</p>
    </div>

    <Catalog
      v-auto-animate
      :items="favStore.favorites"
      is-favorites
      @add-to-favorite="favStore.toggleFavorite"
      @add-to-card="favStore.toggleCartInFavorites"
    />
  </div>
</template>
