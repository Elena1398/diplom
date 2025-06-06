<script setup>
import { onMounted, ref, watch, reactive, provide, computed } from 'vue'
import axios from 'axios'
import Catalog from '@/components/Catalog.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const userRole = computed(() => auth.user?.role || 'guest')

onMounted(() => {
  auth.loadUserFromLocalStorage()
})

const items = ref([])
const cart = ref([])

const filters = reactive({
  sortBy: 'title',
  tastesBy: 'tastes',
  searchQuerry: ''
})

const fetchBaskets = async () => {
  const customersId = localStorage.getItem('customersId')

  if (!customersId) {
    const guestCart = JSON.parse(localStorage.getItem('baskets') || '[]') 
    items.value = items.value.map((item) => {
      const isInGuestCart = guestCart.includes(item.des_id)
      return {
        ...item,
        isAdded: isInGuestCart,
        basketId: null
      }
    })
    return
  }

  // Авторизованный
  try {
    const { data: baskets } = await axios.get(
      `http://localhost:8080/apis/baskets?customersId=${customersId}`
    )
    items.value = items.value.map((item) => {
      const basket = baskets.find((basket) => basket.des_id === item.des_id)
      return {
        ...item,
        isAdded: !!basket,
        basketId: basket ? basket.bas_id : null
      }
    })
  } catch (error) {
    console.log(error)
  }
}

const addToBaskets = async (item) => {
  const customersId = localStorage.getItem('customersId')

  if (!customersId) {
    const guestCart = JSON.parse(localStorage.getItem('baskets') || '[]')

    if (!item.isAdded) {
      item.isAdded = true
      guestCart.push(item.des_id)
      localStorage.setItem('baskets', JSON.stringify(guestCart)) 
    }

    return
  }

  // Авторизованный пользователь
  try {
    const obj = {
      desertId: item.des_id,
      finalWeight: item.weight || 0,
      sumPriceList: item.price,
      quantityDes: 1,
      customersId: Number(customersId)
    }

    item.isAdded = true
    const { data } = await axios.post('http://localhost:8080/apis/basket', obj)
    item.basketId = data.bas_id
  } catch (error) {
    console.log(error)
  }
}

const removeFromCart = async (item) => {
  const customersId = localStorage.getItem('customersId')

  if (!customersId) {
    let guestCart = JSON.parse(localStorage.getItem('baskets') || '[]')
    guestCart = guestCart.filter((id) => id !== item.des_id) // <-- исправлено
    localStorage.setItem('baskets', JSON.stringify(guestCart)) // <-- исправлено

    item.isAdded = false
    return
  }

  // Авторизованный
  try {
    item.isAdded = false
    await axios.delete('http://localhost:8080/apis/basket/' + item.basketId)
    item.basketId = null
  } catch (error) {
    console.log(error)
  }
}

const onClickAddPlus = async (item) => {
  try {
    if (!item.isAdded) {
      await addToBaskets(item)
    } else {
      await removeFromCart(item)
    }
  } catch (error) {
    console.log(error)
  }
}

const onChangeSelect = (event) => {
  filters.sortBy = event.target.value
  fetchItems()
}

const onChangeTastes = (event) => {
  filters.tastesBy = event.target.value
  fetchItems()
}

const onChangeSearchInput = (event) => {
  filters.searchQuerry = event.target.value
}

const fetchFavorites = async () => {
  try {
    const customersId = localStorage.getItem('customersId')
    let favorites = []

    if (customersId) {
      const { data } = await axios.get(
        `http://localhost:8080/apis/favourites?customersId=${customersId}`
      )
      favorites = data
    } else {
      favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    }

    const favoriteIds = new Set(
      Array.isArray(favorites)
        ? typeof favorites[0] === 'object'
          ? favorites.map((f) => f.des_id)
          : favorites
        : []
    )

    items.value = items.value.map((item) => {
      const favoriteItem = favorites.find((fav) => {
        return typeof fav === 'object' && fav.des_id === item.des_id
      })

      return {
        ...item,
        isFavorite: favoriteIds.has(item.des_id),
        favoriteId: favoriteItem ? favoriteItem.favor_id : null
      }
    })
  } catch (error) {
    console.log(error)
  }
}

const addToFavorite = async (item) => {
  const customersId = localStorage.getItem('customersId')

  if (!customersId) {
    let guestFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')

    if (!item.isFavorite) {
      guestFavorites.push(item.des_id)
      item.isFavorite = true
    } else {
      guestFavorites = guestFavorites.filter((id) => id !== item.des_id)
      item.isFavorite = false
    }

    localStorage.setItem('favorites', JSON.stringify(guestFavorites))
    return
  }

  try {
    if (!item.isFavorite) {
      const obj = {
        desertId: item.des_id,
        customersId
      }

      const { data } = await axios.post('http://localhost:8080/apis/favourite', obj)
      item.isFavorite = true
      item.favoriteId = data.favor_id
    } else {
      await axios.delete('http://localhost:8080/apis/favourite/' + item.favoriteId)
      item.isFavorite = false
      item.favoriteId = null
    }

    items.value = items.value.map((des) => {
      if (des.des_id === item.des_id) {
        return {
          ...des,
          isFavorite: item.isFavorite,
          favoriteId: item.favoriteId
        }
      }
      return des
    })
  } catch (err) {
    console.log(err)
  }
}

const fetchItems = async () => {
  const params = {
    section: filters.sortBy,
    tastes: filters.tastesBy !== 'tastes' ? filters.tastesBy : undefined,
    title: filters.searchQuerry || undefined
  }

  try {
    const { data } = await axios.get('http://localhost:8080/apis/des', { params })

    items.value = data.map((item) => ({
      ...item,
      isAdded: false,
      basketId: null,
      isFavorite: false,
      favoriteId: null
    }))

    await fetchFavorites()
    await fetchBaskets()
  } catch (error) {
    console.error('❌ Ошибка при получении десертов:', error)
  }
}

onMounted(async () => {
  await fetchItems()
})

watch(() => filters.sortBy, fetchItems)
watch(() => filters.searchQuerry, fetchItems)
watch(() => filters.tastesBy, fetchItems)

watch(
  () => auth.isAuthenticated,
  async (isAuth) => {
    if (isAuth) {
      await fetchItems() 
    }
  }
)

provide('cart', { cart, addToBaskets, removeFromCart, onClickAddPlus })
provide('addToFavorite', addToFavorite)
</script>

<template>
  <div class="bg-lilacblack m-10">
  </div>
  <div class="p-10 flex">
    <div class="w-1/5 pr-4">
      <h2 class="text-3xl mb-8 font-mono">Фильтры</h2>
      <div class="mb-4">
        <label for="filters" class="block mb-4">
          <a class="text-lg mb-8 p-1 font-mono">Категория</a>
        </label>
        <select
          id="filters"
          @change="onChangeSelect"
          class="border border-slate-300 rounded-md w-9/12 p-1 outline-none focus:border-gray-400 font-mono"
        >
          <option value="title">Все категории</option>
          <option value="1">Торт</option>
          <option value="2">Пирожные</option>
          <option value="3">Выпечка</option>
          <option value="4">Печенье</option>
          <option value="5">Кофеты</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="filters" class="block mb-4">
          <a class="text-lg mb-8 p-1 font-mono">Вкусы</a>
        </label>
        <select
          id="filters"
          @change="onChangeTastes"
          class="border border-slate-300 rounded-md w-9/12 p-1 outline-none focus:border-gray-400 font-mono"
        >
          <option value="tastes">Все вкусы</option>
          <option value="1">Клубника</option>
          <option value="2">Манго</option>
          <option value="3">Шоколад</option>
          <option value="4">Орехи</option>
          <option value="5">Малина</option>
          <option value="6">Кофе</option>
        </select>
      </div>
    </div>
    <div class="w-4/5">
      <div class="flex justify-between mb-8">
        <h2 class="text-3xl font-mono">Категория</h2>
        <div class="relative">
          <img class="absolute left-2 top-1.5" src="../../svg/search.svg" alt="" />
          <input
            @input="onChangeSearchInput"
            class="border border-slate-300 rounded-md py-1 pl-12 pr-10 outline-none focus:border-gray-400 font-mono"
            type="text"
            placeholder="Поиск..."
          />
        </div>
      </div>
      <div v-if="items.length === 0" class="flex flex-col items-center text-lg text-gray-600 m-48">
        <img src="../../public/icons/cake.png" alt="cake" class="mb-4" />
        <a class="text-3xl font-mono" for="username">К сожалению, этой категории пока нет.</a>
      </div>
      <Catalog
        v-else
        :items="items"
        :user-role="userRole"
        @add-to-favorite="addToFavorite"
        :onChangeSearchInput="onChangeSearchInput"
        @add-to-card="onClickAddPlus"
      />
    </div>
  </div>
</template>
