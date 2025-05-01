<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import CardDessert from '../components/CardDessert.vue'

const prop = defineProps({
  id: String,
  isFavorites: Boolean
})
console.log(prop.id)

const cardDes = ref(null)

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:8080/apis/desert/' + prop.id)
    const dessert = response.data

    // Проверим, в избранном ли этот десерт
    const { data: favorites } = await axios.get('http://localhost:8080/apis/favourites')
    const found = favorites.find((f) => f.des_id === dessert.des_id)

    dessert.isFavorite = !!found
    if (found) dessert.favoriteId = found.favor_id

    cardDes.value = normalizeDessert(dessert);
  } catch (error) {
    console.error('Ошибка при загрузке десерта:', error)
  }
})

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
        desertId: item.des_id
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
    console.log(err)
  }
}
</script>

<template>
  <CardDessert
    v-if="cardDes"
    :code="cardDes.des_id"
    :imageUrl="cardDes.photo"
    :title="cardDes.des_name"
    :description="cardDes.description"
    :structure="cardDes.ingredients"
    :weight="cardDes.weight"
    :protein="cardDes.protein"
    :fast="cardDes.fast"
    :carbohydrates="cardDes.carbohydrates"
    :calories="isNaN(parseFloat(cardDes.calories)) ? 0 : parseFloat(cardDes.calories)"
    :price="isNaN(parseFloat(cardDes.price)) ? 0 : parseFloat(cardDes.price)"
    :isFavorite="cardDes.isFavorite"
    :onClickFavorite="() => toggleFavorite(cardDes)"
  />
</template>
