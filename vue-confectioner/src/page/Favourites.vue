<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Catalog from '@/components/Catalog.vue';

const favorites = ref([])

onMounted(async () => {
  try {
    const { data } = await axios.get('http://localhost:8080/apis/favourites');
    favorites.value = data;
  } catch (err) {
    console.error(err);
  }
}); 
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

