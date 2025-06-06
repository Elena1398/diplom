<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import axios from 'axios'
import debounce from 'lodash/debounce'
import { useCartStore } from '@/stores/baskets'
const cartStore = useCartStore()

watch(
  () => cartStore.baskets,
  (newVal, newQuantity) => {
    console.log('Обновление корзины:', newVal, newQuantity)
  }
)

const props = defineProps({
  code: Number,
  imageUrl: String,
  title: String,
  price: Number,
  basketId: Number,
  weight: Number,
  quantity: Number,
  isFromCart: {
    type: Boolean,
    default: false
  }
})

// Форматирование цены
const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(price)
}

const currentWeight = ref(Number(props.weight) || 0)
const currentQuantity = ref(props.quantity || 1)

const priceOptions = ref([]) // варианты веса и цен
const selectedPrice = ref(props.price)

const isCake = computed(() => {
  return props.title.toLowerCase().includes('торт') || currentWeight.value >= 500
})

const productQuantitySettings = {
  'Кофеты "Трюфель на молочном шоколаде"': { start: 6, step: 3 },
  'Кофеты "Трюфель на молочном шоколаде с вафельной крошкой"': { start: 6, step: 3 },
  'Печенье сэндвич': { start: 10, step: 1 }
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
    ? selectedPrice.value // Это вся цена за выбранный вес
    : selectedPrice.value * currentQuantity.value
})

// Загрузка ценовых опций для товара
const fetchPriceOptions = async () => {
  try {
    const { data } = await axios.get(`http://localhost:8080/apis/desserts/${props.code}/prices`)
    priceOptions.value = data

    if (isCake.value && data.length > 0) {
      const matched = data.find((option) => Number(option.weight) === Number(currentWeight.value))
      if (matched) {
        selectedPrice.value = matched.price
        // НЕ трогаем currentWeight — он уже правильный из props
      } else {
        // Только если вес НЕ передан или не совпадает — задаём дефолт
        const first = data[0]
        currentWeight.value = first.weight
        selectedPrice.value = first.price
      }
    } else if (!isCake.value && data.length > 0) {
      selectedPrice.value = data[0].price
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

const updateCartItemsBulk = debounce(() => {
  cartStore.updateCartItem({
    basketId: props.basketId,
    weight: isCake.value ? currentWeight.value : 0,
    quantity: isCake.value ? 0 : currentQuantity.value,
    price: selectedPrice.value
  })
}, 300)

watch([currentWeight, currentQuantity], () => {
  if (props.isFromCart) {
    debouncedUpdateItem()
  } else {
    updateCartItemsBulk()
  }

  const itemKey = `cart-item-${props.code}`
  const updatedItem = {
    weight: currentWeight.value,
    quantity: currentQuantity.value,
    price: selectedPrice.value
  }
  localStorage.setItem(itemKey, JSON.stringify(updatedItem))
})


const hasChanged = ref(false) // Новый флаг: меняли ли вручную

watch(
  () => [props.weight, props.quantity],
  ([newWeight, newQuantity]) => {
    if (hasChanged.value) return // если пользователь изменял локально, не перезаписываем

    if (isCake.value && Number(newWeight) !== Number(currentWeight.value)) {
      const matched = priceOptions.value.find((p) => p.weight === newWeight)
      if (matched) {
        currentWeight.value = matched.weight
        selectedPrice.value = matched.price
      }
    } else if (!isCake.value && newQuantity !== currentQuantity.value) {
      currentQuantity.value = newQuantity || 1
    }
  },
  { immediate: true }
)

onMounted(async () => {
  const itemKey = `cart-item-${props.code}`
  const saved = localStorage.getItem(itemKey)
  if (saved) {
    const parsed = JSON.parse(saved)
    if (parsed.weight) currentWeight.value = parsed.weight
    if (parsed.quantity) currentQuantity.value = parsed.quantity
    if (parsed.price) selectedPrice.value = parsed.price
  } else {
    const settings = productQuantitySettings[props.title] || { start: 1, step: 1 }
    currentQuantity.value = settings.start
  }
  await fetchPriceOptions()
})

// Удаление товара
const removeFromCart = () => {
  const itemKey = `cart-item-${props.code}`
  localStorage.removeItem(itemKey)

  const customersId = localStorage.getItem('customersId')
  if (customersId) {
    cartStore.removeFromCart(props.basketId)
  } else {
    cartStore.removeFromCart(null, props.code) // код — это des_id
  }

  emit('remove-item', props.basketId)
}



const emit = defineEmits(['remove-item', 'update-item'])
console.log('CartItem props:', props)
</script>

<template>
  <div class="flex items-center border border-slate-300 p-4 rounded-xl bg-white gap-4 shadow-sm mt-4">
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
