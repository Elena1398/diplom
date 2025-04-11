<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
const props = defineProps({
  code: Number,
  imageUrl: String,
  title: String,
  description: String,
  structure: String,
  weight: Number,
  protein: Number,
  fast: Number,
  carbohydrates: Number,
  calories: Number,
  price: Number,
  isFavorite: Boolean,
  onClickFavorite: Function 
})

// Функция для форматирования веса
const formattedWeight = (weight) => {
  if (weight >= 1000) {
    return (weight / 1000).toFixed(1) + ' кг' // Форматируем вес в кг
  }
  return weight + ' г' // Форматируем вес в гм
}

const isAdded = ref(false) // состояние, добавлен ли товар в корзину

// Предположим, что `code` — это id товара
const addToCart = async () => {
  if (!isAdded.value) {
    try {
      const obj = { desertId: props.code } // ID передаётся как prop
      await axios.post('http://localhost:8080/apis/basket', obj)
      isAdded.value = true
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error)
    }
  }
}

// Проверка, находится ли товар в корзине
onMounted(async () => {
  try {
    const { data: baskets } = await axios.get('http://localhost:8080/apis/baskets')
    isAdded.value = baskets.some((item) => item.des_id === props.code)
  } catch (err) {
    console.error('Ошибка загрузки корзины:', err)
  }
})
</script>

<template>
  <div class="flex mt-5">
    <div class="w-1/2 p-10">
      <img class="rounded-xl" :src="imageUrl" alt="des" />
    </div>

    <div class="w-1/2 p-10">
      <div class="text-3xl mb-5">
        <h1>{{ title }}</h1>
      </div>
      <div>
        <span class="text-xl text-slate-400">Цена: </span>
        <b class="text-lg"> {{ price }} ₽ \ {{ formattedWeight(weight) }}</b>
      </div>
      <div>
        <h3 class="text-xl font-semibold mt-2">Описание:</h3>
        {{ description }}
      </div>
      <div>
        <h3 class="text-xl font-semibold mt-2">Состав:</h3>
        {{ structure }}
      </div>
      <div>
        <h3 class="text-xl font-semibold mt-2">Пищевая ценность на 100 г:</h3>
        <div class="grid grid-cols-4 gap-1 mt-5">
          <div class="border border-slate-300 rounded-lg p-1 text-center">
            Белки:<br />
            {{ protein }} г
          </div>
          <div class="border border-slate-300 rounded-lg p-1 text-center">
            Жиры:<br />
            {{ fast }} г
          </div>
          <div class="border border-slate-300 rounded-lg p-1 text-center">
            Углеводы:<br />
            {{ carbohydrates }} г
          </div>
          <div class="border border-slate-300 rounded-lg p-1 text-center">
            Калории:<br />
            {{ calories }} ккал
          </div>
        </div>
      </div>
      <div class="flex items-center mt-5 space-x-4">
        <button
          @click="addToCart"
          class="border border-slate-300 rounded-lg p-2 font-mono text-center"
          :disabled="isAdded"
        >
          {{ isAdded ? 'Товар добавлен в корзину' : 'Добавить в корзину' }}
        </button>

        <img
          @click="onClickFavorite"
          :src="!isFavorite ? '../svg/lik.svg' : '../svg/heart.png'"
          alt="like"
          class="border border-slate-300 rounded-lg p-2 w-10 h-10 cursor-pointer transition-transform hover:scale-110"
        />
      </div>
    </div>
  </div>
</template>

<style>
button {
  width: 50%; /* Полная ширина кнопки */
  background-color: #a69dab; /* Цвет фона кнопки */
  color: white; /* Цвет текста кнопки */
  cursor: pointer; /* Курсор при наведении на кнопку */
  transition: background-color 0.3s; /* Плавный переход для фона кнопки */
}

button:hover {
  background-color: #979598; /* Темнее при наведении */
}
</style>
