<script setup>
const props = defineProps({
  code: Number,
  imageUrl: String,
  title: String,
  // weight: Number,
  price: Number,
  isFavorite: Boolean,
  isAdded: Boolean,
  onClickAdd: Function,
  onClickFavorite: Function
})

const showFavoriteButton = Boolean(props.onClickFavorite)
</script>

<template>
  <div
    class="relative bg-white border border-slate-300 rounded-3xl p-6 cursor-pointer transition hover:-translate-y-2 hover:shadow-xl flex flex-col h-full"
  >
    <img
      v-if="showFavoriteButton"
      class="absolute top-8 left-8 w-5 h-5"
      @click="onClickFavorite"
      :src="!isFavorite ? '../svg/lik.svg' : '../svg/heart.png'"
      alt="like"
    />
    <router-link :to="{ name: 'DecertPage', params: { id: props.code } }">
      <img :src="imageUrl" alt="decert" class="rounded-xl mb-4" />
      <p class="mt-2 font-bold text-center flex-grow min-h-[60px]">{{ title }}</p>
    </router-link>
    <div class="flex justify-between mt-5">
      <div class="flex flex-col m-5">
        <span class="text-slate-400">Цена:</span>
        <b>{{ price }}₽</b>
      </div>
      <img
        v-if="showFavoriteButton"
        class="pt-10"
        @click="onClickAdd"
        :src="!isAdded ? '../svg/plus.svg' : '../svg/check.svg'"
        alt="plus"
      />
    </div>
  </div>
</template>



