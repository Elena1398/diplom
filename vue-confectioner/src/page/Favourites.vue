<script setup>
import { onMounted } from 'vue'
import Catalog from '@/components/Catalog.vue'
import { useFavoritesStore } from '@/stores/favorites'

const favStore = useFavoritesStore()

onMounted(() => {
  favStore.loadFavorites()
})
</script>

<template>
  <div class="p-16">
    <h2 class="text-3xl mb-8 font-mono">Избранное</h2>

    <div
      v-if="favStore.favorites.isRemoving"
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
