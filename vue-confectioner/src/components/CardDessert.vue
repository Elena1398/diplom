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
  onClickFavorite: Function,
  isAdded: Boolean,
  basketId: Number
})

const priceOptions = ref([])
const selectedWeight = ref(props.weight)
const selectedPrice = ref(props.price)
const quantity = ref(1)
const localIsAdded = ref(props.isAdded || false)
const localBasketId = ref(props.basketId || null)
const localIsFavorite = ref(props.isFavorite || false)

const customersId = localStorage.getItem('customersId')

const isCake = computed(() => selectedWeight.value >= 500)

const productQuantitySettings = {
  'Кофеты "Трюфель на молочном шоколаде"': { start: 6, step: 3 },
  'Кофеты "Трюфель на молочном шоколаде с вафельной крошкой"': { start: 6, step: 3 }
}
const productSettings = computed(
  () => productQuantitySettings[props.title] || { start: 1, step: 1 }
)

const minOrderText = computed(() => {
  return productSettings.value.start > 1
    ? `Минимальный заказ: от ${productSettings.value.start} шт.`
    : ''
})

const totalPrice = computed(() => {
  return isCake.value ? selectedPrice.value : selectedPrice.value * quantity.value
})

const formatPrice = (price) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(price)

const formattedWeight = (weight) =>
  weight >= 1000 ? (weight / 1000).toFixed(1) + ' кг' : weight + ' г'

const fetchPriceOptions = async () => {
  try {
    const { data } = await axios.get(`http://localhost:8080/apis/desserts/${props.code}/prices`)
    priceOptions.value = data

    if (data.length > 0) {
      selectedWeight.value = data[0].weight
      selectedPrice.value = data[0].price
    }
  } catch (error) {
    console.error('Ошибка загрузки цен:', error)
  }
}

const increaseWeight = () => {
  if (isCake.value) {
    const currentIndex = priceOptions.value.findIndex(
      (option) => Number(option.weight) === Number(selectedWeight.value)
    )
    if (currentIndex < priceOptions.value.length - 1) {
      const nextOption = priceOptions.value[currentIndex + 1]
      selectedWeight.value = nextOption.weight
      selectedPrice.value = nextOption.price
    }
  } else {
    quantity.value += productSettings.value.step
  }
}

const decreaseWeight = () => {
  if (isCake.value) {
    const currentIndex = priceOptions.value.findIndex(
      (option) => Number(option.weight) === Number(selectedWeight.value)
    )
    if (currentIndex > 0) {
      const prevOption = priceOptions.value[currentIndex - 1]
      selectedWeight.value = prevOption.weight
      selectedPrice.value = prevOption.price
    }
  } else {
    const min = productSettings.value.start
    if (quantity.value > min) {
      quantity.value -= productSettings.value.step
    }
  }
}

const addOrRemoveFromCart = async () => {
  console.log('addOrRemoveFromCart вызвана')
  if (!localIsAdded.value) {
    try {
      const obj = {
        desertId: props.code,
        finalWeight: isCake.value ? selectedWeight.value : 0,
        quantityDes: isCake.value ? 0 : quantity.value,
        sumPriceList: isCake.value ? selectedPrice.value : selectedPrice.value * quantity.value,
        customersId
      }

      const { data } = await axios.post('http://localhost:8080/apis/basket', obj)
      localIsAdded.value = true
      localBasketId.value = data.bas_id
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error)
    }
  } else {
    if (localIsAdded.value) {
      try {
        if (localBasketId.value) {
          const response = await axios.delete(
            `http://localhost:8080/apis/basket/${localBasketId.value}`
          )
          console.log('Ответ сервера: ', response)
          localIsAdded.value = false
          localBasketId.value = null
        }
      } catch (error) {
        console.error('Ошибка при удалении из корзины:', error)
      }
    }
  }
}

const toggleFavorite = async () => {
  const customersId = localStorage.getItem('customersId')

  if (!customersId) {
    let guestFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (!localIsFavorite.value) {
      guestFavorites.push(props.code)
      localIsFavorite.value = true
    } else {
      guestFavorites = guestFavorites.filter((id) => id !== props.code)
      localIsFavorite.value = false
    }
    localStorage.setItem('favorites', JSON.stringify(guestFavorites))
    return
  }

  if (!localIsFavorite.value) {
    await axios.post('http://localhost:8080/apis/favourite', {
      desertId: props.code,
      customersId
    })
    localIsFavorite.value = true
    // можешь сохранить res.data.favor_id при необходимости
  } else {
    // ⚠️ Тут тебе нужен ID записи в избранном для DELETE
    // Его ты не сохраняешь нигде → ошибка 404
    const { data: favs } = await axios.get(
      `http://localhost:8080/apis/favourites?customersId=${customersId}`
    )
    const target = favs.find((f) => f.des_id === props.code)
    if (!target) {
      console.warn('Не найдено избранное для удаления')
      return
    }

    await axios.delete(`http://localhost:8080/apis/favourite/${target.favor_id}`)
    localIsFavorite.value = false
  }
}

onMounted(async () => {
  await fetchPriceOptions()

  if (customersId) {
    // Проверка корзины
    const { data: baskets } = await axios.get(
      `http://localhost:8080/apis/baskets?customersId=${customersId}`
    )
    const matchedBasket = baskets.find((b) => b.des_id === props.code)
    if (matchedBasket) {
      localIsAdded.value = true
      localBasketId.value = matchedBasket.bas_id
    }

    // Проверка избранного
    const { data: favs } = await axios.get(
      `http://localhost:8080/apis/favourites?customersId=${customersId}`
    )
    localIsFavorite.value = favs.some((f) => f.des_id === props.code)
  } else {
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
    const guestFav = JSON.parse(localStorage.getItem('favorites') || '[]')
    localIsAdded.value = guestCart.includes(props.code)
    localIsFavorite.value = guestFav.includes(props.code)
  }
})

watch(quantity, async (newQuantity) => {
  if (localIsAdded.value && localBasketId.value && !isCake.value) {
    try {
      const updatedItem = {
        desertId: props.code,
        finalWeight: 0,
        quantityDes: newQuantity,
        sumPriceList: selectedPrice.value * newQuantity
      }
      await axios.put(
        `http://localhost:8080/apis/baskets/update/${localBasketId.value}`,
        updatedItem
      )
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
      <h1 class="text-3xl mb-5">{{ title }}</h1>

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
          @click="decreaseWeight"
          class="border p-2 w-32 bg-lilac rounded-xl text-white hover:bg-purple-600 active:scale-90 transition"
        >
          -
        </button>
        <div class="text-lg font-semibold mx-4">
          {{ isCake ? formattedWeight(selectedWeight) : quantity + ' шт.' }}
        </div>
        <button
          @click="increaseWeight"
          class="border p-2 w-32 bg-lilac rounded-xl text-white hover:bg-purple-600 active:scale-90 transition"
        >
          +
        </button>
      </div>

      <div v-if="minOrderText" class="mt-2 text-slate-400 text-base">{{ minOrderText }}</div>

      <div class="flex items-center mt-5 space-x-4">
        <button
          @click="addOrRemoveFromCart"
          class="border border-slate-300 rounded-lg px-6 py-2 bg-lilac w-auto size-min text-center font-mono text-white hover:bg-purple-600 active:scale-90 transition"
        >
          {{ localIsAdded ? 'Удалить из корзины' : 'Добавить в корзину' }}
        </button>

        <img
          @click="toggleFavorite"
          :src="!localIsFavorite ? '../svg/lik.svg' : '../svg/heart.png'"
          alt="like"
          class="border rounded-lg p-2 w-10 h-10 cursor-pointer transition-transform hover:scale-110"
        />
      </div>
    </div>
  </div>
</template>
