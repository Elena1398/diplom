<script setup>
import { ref, onMounted, computed, watch } from 'vue'
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

const isAdded = ref(false)
const priceOptions = ref([]) // список вариантов веса и цен
const selectedWeight = ref(props.weight)
const selectedPrice = ref(props.price)

const totalPrice = computed(() => {
  if (isCake.value) {
    return selectedPrice.value
  } else {
    return selectedPrice.value * quantity.value
  }
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(price)
}

const formattedWeight = (weight) => {
  if (weight >= 1000) {
    return (weight / 1000).toFixed(1) + ' кг'
  }
  return weight + ' г'
}

const fetchPriceOptions = async () => {
  try {
    const { data } = await axios.get(`http://localhost:8080/apis/desserts/${props.code}/prices`)
    priceOptions.value = data

    // Логируем данные, которые пришли с сервера
    console.log('Fetched price options:', priceOptions.value)

    if (data.length > 0) {
      selectedWeight.value = data[0].weight
      selectedPrice.value = data[0].price
    }
  } catch (error) {
    console.error('Ошибка загрузки цен:', error)
  }
}

const minOrderText = computed(() => {
  if (productSettings.value.start > 1) {
    return `Минимальный заказ: от ${productSettings.value.start} шт.`
  }
  return ''
})

const productQuantitySettings = {
  'Кофеты "Трюфель на молочном шоколаде"': { start: 6, step: 3 },
  'Кофеты "Трюфель на молочном шоколаде с вафельной крошкой"': { start: 6, step: 3 }
  // можно добавить другие товары сюда
}

const productSettings = computed(() => {
  return productQuantitySettings[props.title] || { start: 1, step: 1 }
})

const isCake = computed(() => selectedWeight.value >= 500) // или другое условие
const quantity = ref(1)

const increaseWeight = () => {
  if (isCake.value) {
    // Логируем список доступных опций
    console.log('Available priceOptions:', priceOptions.value)

    // Преобразуем selectedWeight и weight из priceOptions в числа для корректного сравнения
    const currentIndex = priceOptions.value.findIndex(
      (option) => Number(option.weight) === Number(selectedWeight.value)
    )

    // Логируем индекс и вес
    console.log(
      'increaseWeight - currentIndex: ',
      currentIndex,
      'selectedWeight: ',
      selectedWeight.value
    )

    if (currentIndex === -1) {
      console.error('Selected weight not found in priceOptions. Check the data.')
      return
    }

    // Проверяем, есть ли следующий элемент в списке опций
    if (currentIndex < priceOptions.value.length - 1) {
      const nextOption = priceOptions.value[currentIndex + 1]
      selectedWeight.value = nextOption.weight
      selectedPrice.value = nextOption.price
    } else {
      console.log('No more weight options available to increase')
    }
  } else {
    quantity.value += productSettings.value.step
  }
}

const decreaseWeight = () => {
  if (isCake.value) {
    // Логируем список доступных опций
    console.log('Available priceOptions:', priceOptions.value)

    // Преобразуем selectedWeight и weight из priceOptions в числа для корректного сравнения
    const currentIndex = priceOptions.value.findIndex(
      (option) => Number(option.weight) === Number(selectedWeight.value)
    )

    // Логируем индекс и вес
    console.log(
      'decreaseWeight - currentIndex: ',
      currentIndex,
      'selectedWeight: ',
      selectedWeight.value
    )

    if (currentIndex === -1) {
      console.error('Selected weight not found in priceOptions. Check the data.')
      return
    }

    // Проверяем, есть ли предыдущий элемент в списке опций
    if (currentIndex > 0) {
      const prevOption = priceOptions.value[currentIndex - 1]
      selectedWeight.value = prevOption.weight
      selectedPrice.value = prevOption.price
    } else {
      console.log('No more weight options available to decrease')
    }
  } else {
    const min = productSettings.value.start
    if (quantity.value > min) {
      quantity.value -= productSettings.value.step
    }
  }
}

const basketId = ref(null) // добавляем basketId

const addOrRemoveFromCart = async () => {
  if (!isAdded.value) {
    try {
      const obj = {
        desertId: props.code,
        finalWeight: isCake.value ? selectedWeight.value : 0,
        quantityDes: isCake.value ? 0 : quantity.value,
        sumPriceList: isCake.value ? selectedPrice.value : selectedPrice.value * quantity.value
      }

      const { data } = await axios.post('http://localhost:8080/apis/basket', obj)

      isAdded.value = true
      basketId.value = data.bas_id
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error)
    }
  } else {
    try {
      if (basketId.value) {
        await axios.delete(`http://localhost:8080/apis/basket/${basketId.value}`)
        isAdded.value = false
        basketId.value = null
      } else {
        console.error('basketId не найден, нельзя удалить товар')
      }
    } catch (error) {
      console.error('Ошибка при удалении из корзины:', error)
    }
  }
}

onMounted(async () => {
  await fetchPriceOptions()

  quantity.value = productSettings.value.start

  try {
    const { data: baskets } = await axios.get('http://localhost:8080/apis/baskets')
    const basketItem = baskets.find((item) => item.des_id === props.code)

    if (basketItem) {
      isAdded.value = true
      basketId.value = basketItem.bas_id

      if (basketItem.quantity_des > 0) {
        quantity.value = basketItem.quantity_des
      }
      if (basketItem.final_weight > 0) {
        selectedWeight.value = basketItem.final_weight
      }
      if (basketItem.sum_price_list) {
        selectedPrice.value = basketItem.sum_price_list / (basketItem.quantity_des || 1)
      }
    }
  } catch (err) {
    console.error('Ошибка загрузки корзины:', err)
  }
})

watch(quantity, async (newQuantity) => {
  if (isAdded.value && basketId.value && !isCake.value) {
    try {
      const updatedItem = {
        desertId: props.code,
        finalWeight: 0,
        quantityDes: newQuantity,
        sumPriceList: selectedPrice.value * newQuantity
      }
      await axios.put(`http://localhost:8080/apis/baskets/update/${basketId.value}`, updatedItem)
      console.log('Корзина обновлена при изменении количества')
    } catch (error) {
      console.error('Ошибка при обновлении корзины (количество):', error)
    }
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
        <b class="text-lg">{{ formatPrice(totalPrice) }} / {{ formattedWeight(selectedWeight) }}</b>
      </div>
      <div class="mt-5">
        <h3 class="text-xl font-semibold">Описание:</h3>
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
            Белки:<br />{{ protein }} г
          </div>
          <div class="border border-slate-300 rounded-lg p-1 text-center">
            Жиры:<br />{{ fast }} г
          </div>
          <div class="border border-slate-300 rounded-lg p-1 text-center">
            Углеводы:<br />{{ carbohydrates }} г
          </div>
          <div class="border border-slate-300 rounded-lg p-1 text-center">
            Калории:<br />{{ calories }} ккал
          </div>
        </div>
      </div>
      <div class="flex items-center mt-5 ml-1 space-x-2">
        <button
          class="border border-slate-300 rounded-lg p-2 font-mono text-center bg-gray-500 text-white hover:bg-gray-400 active:scale-90 transition-transform duration-300"
          @click="decreaseWeight"
        >
          -
        </button>

        <div class="text-lg font-semibold mx-4">
          {{ isCake ? formattedWeight(selectedWeight) : quantity + ' шт.' }}
        </div>

        <button
          class="border border-slate-300 rounded-lg p-2 font-mono text-center bg-gray-500 text-white hover:bg-gray-400 active:scale-90 transition-transform duration-300"
          @click="increaseWeight"
        >
          +
        </button>
      </div>
      <div v-if="minOrderText" class="mt-2 text-slate-400 text-base">
        {{ minOrderText }}
      </div>
      <div class="flex items-center mt-5 space-x-4">
        <button
          @click="addOrRemoveFromCart"
          class="border border-slate-300 rounded-lg p-2 font-mono text-center"
        >
          {{ isAdded ? 'Удалить из корзины' : 'Добавить в корзину' }}
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

<style scoped>
button {
  width: auto;
  min-width: 100px;
  background-color: #a69dab;
  color: white;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  background-color: #979598;
}
</style>
