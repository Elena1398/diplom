<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import axios from 'axios'
import debounce from 'lodash/debounce'

const props = defineProps({
  code: Number,
  imageUrl: String,
  title: String,
  price: Number,
  basketId: Number,
  weight: Number,
  quantity: Number
})

// Форматирование цены
const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(price)
}

const currentWeight = ref(props.weight || 0)
const currentQuantity = ref(props.quantity || 1)

const priceOptions = ref([]) // варианты веса и цен
const selectedPrice = ref(props.price)

const isCake = computed(() => currentWeight.value >= 500) // пирог или нет



const productQuantitySettings = {
  'Кофеты "Трюфель на молочном шоколаде"': { start: 6, step: 3 },
  'Кофеты "Трюфель на молочном шоколаде с вафельной крошкой"': { start: 6, step: 3 }
}

const productSettings = computed(() => {
  return productQuantitySettings[props.title] || { start: 1, step: 1 }
})

const formattedWeight = (weight) => {
  if (weight >= 1000) {
    return (weight / 1000).toFixed(1) + ' кг'
  }
  return weight + ' г'
}


const increase = () => {
  hasChanged.value = true
  if (isCake.value) {
    const currentIndex = priceOptions.value.findIndex(
      (option) => Number(option.weight) === Number(currentWeight.value)
    )
    if (currentIndex < priceOptions.value.length - 1) {
      const next = priceOptions.value[currentIndex + 1]
      currentWeight.value = next.weight
      selectedPrice.value = next.price
    }
  } else {
    currentQuantity.value += productSettings.value.step
  }
}

const decrease = () => {
  hasChanged.value = true
  if (isCake.value) {
    const currentIndex = priceOptions.value.findIndex(
      (option) => Number(option.weight) === Number(currentWeight.value)
    )
    if (currentIndex > 0) {
      const prev = priceOptions.value[currentIndex - 1]
      currentWeight.value = prev.weight
      selectedPrice.value = prev.price
    }
  } else {
    const min = productSettings.value.start
    const step = productSettings.value.step
    if (currentQuantity.value - step >= min) {
      currentQuantity.value -= step
    }
  }
}

// Вычисление общей стоимости
// const totalPrice = computed(() => {
//   if (isCake.value) {
//     return (selectedPrice.value / 1000) * currentWeight.value
//   } else {
//     return selectedPrice.value * currentQuantity.value
//   }
// })

const totalPrice = computed(() => {
  return isCake.value
    ? selectedPrice.value
    : selectedPrice.value * currentQuantity.value
})



// Загрузка ценовых опций для товара
const fetchPriceOptions = async () => {
  try {
    const { data } = await axios.get(`http://localhost:8080/apis/desserts/${props.code}/prices`)
    priceOptions.value = data

    if (isCake.value && data.length > 0) {
      const match = data.find((option) => Number(option.weight) === Number(currentWeight.value))


      if (match) {
        selectedPrice.value = match.price
      } else {
        const localMatch = data.find((option) => option.weight === currentWeight.value)
        selectedPrice.value = localMatch ? localMatch.price : data[0].price
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки цен:', error)
  }
}


// Отправляем обновления родителю
const debouncedUpdateItem = debounce(() => {
  emit('update-item', {
  basketId: props.basketId,
  weight: isCake.value ? currentWeight.value : 0,
  quantity: isCake.value ? 0 : currentQuantity.value,
  price: selectedPrice.value
})

}, 300) // Задержка 300мс

watch([currentWeight, currentQuantity], () => {
  debouncedUpdateItem()
})

const hasChanged = ref(false) // Новый флаг: меняли ли вручную

watch([() => props.weight, () => props.quantity], ([newWeight, newQuantity]) => {
  if (!hasChanged.value) {
    currentWeight.value = newWeight || 0
    currentQuantity.value = newQuantity || 1
    selectedPrice.value = props.price
  }
})
watch(selectedPrice, (newPrice) => {
  console.log('New selected price:', newPrice)
})

// Удаление товара
const removeFromCart = () => {
  emit('remove-item', props.basketId)
}


// При старте
onMounted(async () => {
  await fetchPriceOptions()
})

const emit = defineEmits(['remove-item', 'update-item'])
</script>

<template>
  <div class="flex items-center border border-slate-300 p-4 rounded-xl gap-4 shadow-sm mt-4">
    <router-link :to="{ name: 'DecertPage', params: { id: props.code } }">
      <img :src="imageUrl" alt="dessert" class="w-40 h-32 object-cover rounded-lg" />
    </router-link>

    <div class="flex flex-grow flex-col space-y-2 flex-1">
      <p class="text-lg font-medium">{{ title }}</p>
      <div class="flex justify-between items-center mt-4">
        <b class="text-xl text-gray-700">{{ formatPrice(totalPrice) }}</b>
        <div class="flex items-center">
          <button
            @click="decrease"
            class="text-white w-lg bg-lilac rounded-xl px-4 py-2 hover:bg-purple-600 active:scale-90 transition"
          >
            -
          </button>

          <div class="text-lg font-semibold mx-4">
            {{ isCake ? formattedWeight(currentWeight) : currentQuantity + ' шт.' }}
          </div>

          <button
            @click="increase"
            class="text-white w-lg bg-lilac rounded-xl px-4 py-2 hover:bg-purple-600 active:scale-90 transition"
          >
            +
          </button>
        </div>

        <img
          class="w-6 h-6 opacity-40 hover:opacity-100 cursor-pointer transition"
          src="/svg/close.svg"
          alt="Удалить"
          @click="removeFromCart"
        />
      </div>
    </div>
  </div>
</template>
