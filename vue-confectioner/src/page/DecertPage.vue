<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import CardDessert from '../components/CardDessert.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const customersId = localStorage.getItem('customersId')

const props = defineProps({
  id: String,
  isFavorites: Boolean
})

const cardDes = ref(null)
const isLoading = ref(true)

const normalizeDessert = (dessert) => {
  return {
    ...dessert,
    weight: toNumber(dessert.weight),
    protein: toNumber(dessert.protein),
    fast: toNumber(dessert.fast),
    carbohydrates: toNumber(dessert.carbohydrates),
    calories: toNumber(dessert.calories),
    price: toNumber(dessert.price)
  }
}

const toNumber = (value) => {
  const num = parseFloat(value)
  return isNaN(num) ? 0 : num
}

const toggleFavorite = async (item) => {
  try {
    if (!item.isFavorite) {
      const obj = {
        desertId: item.des_id,
        customersId: customersId
      }

      item.isFavorite = true
      const { data } = await axios.post('http://localhost:8080/apis/favourite', obj)
      item.favoriteId = data.favor_id
    } else {
      item.isFavorite = false
      await axios.delete('http://localhost:8080/apis/favourite/' + item.favoriteId)
      item.favoriteId = null
    }
  } catch (err) {
    console.error('Ошибка при работе с избранным:', err)
  }
}

onMounted(async () => {
  auth.loadUserFromLocalStorage()
  try {
    const response = await axios.get('http://localhost:8080/apis/desert/' + props.id)
    const dessert = response.data

    // === Загружаем избранное ===
    const { data: favorites } = await axios.get('http://localhost:8080/apis/favourites')
    const foundFavorite = favorites.find((f) => f.des_id === dessert.des_id)
    dessert.isFavorite = !!foundFavorite
    if (foundFavorite) dessert.favoriteId = foundFavorite.favor_id

    // === Загружаем корзину ===
    const { data: baskets } = await axios.get('http://localhost:8080/apis/baskets')
    const foundBasket = baskets.find((b) => b.des_id === dessert.des_id)
    dessert.isAdded = !!foundBasket
    if (foundBasket) dessert.basketId = foundBasket.bas_id

    cardDes.value = normalizeDessert(dessert)
  } catch (error) {
    console.error('Ошибка при загрузке десерта:', error)
  } finally {
    isLoading.value = false
  }
})

</script>

<template>
  <div v-if="isLoading" class="text-center py-10 text-gray-500">Загрузка десерта...</div>

  <CardDessert
    v-else-if="cardDes"
    :code="cardDes.des_id"
    :imageUrl="cardDes.photo"
    :title="cardDes.des_name"
    :description="cardDes.description"
    :structure="cardDes.ingredients"
    :weight="cardDes.weight"
    :protein="cardDes.protein"
    :fast="cardDes.fast"
    :carbohydrates="cardDes.carbohydrates"
    :calories="cardDes.calories"
    :price="cardDes.price"
    :isFavorite="cardDes.isFavorite"
    :onClickFavorite="() => toggleFavorite(cardDes)"
  />
</template>
