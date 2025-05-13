<script setup>
import { onMounted, ref, watch, reactive, provide } from 'vue'
import axios from 'axios'
import Catalog from '@/components/Catalog.vue'
// import Main from '@/components/Main.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

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

// const fetchBaskets = async () => {
//   try {
//     const { data: baskets } = await axios.get('http://localhost:8080/apis/baskets')

//     items.value = items.value.map((item) => {
//       const basket = baskets.find((basket) => basket.des_id === item.des_id)

//       if (!basket) {
//         return item
//       }

//       return {
//         ...item,
//         isAdded: true,
//         basketId: basket.bas_id
//       }
//     })
//   } catch (error) {
//     console.log(error)
//   }
// }

const fetchBaskets = async () => {
  const customersId = localStorage.getItem('customersId')

  if (!customersId) {
    // Гость
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
    items.value = items.value.map((item) => {
      const isInGuestCart = guestCart.some(g => g.des_id === item.des_id)
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
    const { data: baskets } = await axios.get(`http://localhost:8080/apis/baskets?customersId=${customersId}`)
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

// const addToBaskets = async (item) => {
//   try {
//     const obj = {
//       desertId: item.des_id,
//       finalWeight: item.weight || 0,
//       sumPriceList: item.price, // сюда кладёшь цену
//       quantityDes: 1 // если нет выбора количества — можно 1
//     }

//     item.isAdded = true
//     const { data } = await axios.post('http://localhost:8080/apis/basket', obj)
//     item.basketId = data.bas_id
//   } catch (error) {
//     console.log(error)
//   }
// }

const addToBaskets = async (item) => {
  const customersId = localStorage.getItem('customersId')

  if (!customersId) {
    // Гостевая корзина
    let guestBaskets = JSON.parse(localStorage.getItem('cart') || '[]')

    if (!item.isAdded) {
      item.isAdded = true
      guestBaskets.push(item.des_id)
    }

    localStorage.setItem('cart', JSON.stringify(guestBaskets))
    return
  }

  // Авторизованный пользователь
  try {
    const obj = {
      desertId: item.des_id,
      finalWeight: item.weight || 0,
      sumPriceList: item.price,
      quantityDes: 1,
      customersId: Number(customersId) // ✅ Обязательно передаём
    }

    item.isAdded = true
    const { data } = await axios.post('http://localhost:8080/apis/basket', obj)
    item.basketId = data.bas_id
  } catch (error) {
    console.log(error)
  }
}

// const removeFromCart = async (item) => {
//   try {
//     item.isAdded = false
//     await axios.delete('http://localhost:8080/apis/basket/' + item.basketId)
//     item.basketId = null
//   } catch (error) {
//     console.log(error)
//   }
// }
const removeFromCart = async (item) => {
  const customersId = localStorage.getItem('customersId')

  if (!customersId) {
    // Гостевая корзина
    let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
    guestCart = guestCart.filter(i => i.des_id !== item.des_id)
    localStorage.setItem('guestCart', JSON.stringify(guestCart))

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
    const customersId = localStorage.getItem('customersId');
    let favorites = [];

    if (customersId) {
      const { data } = await axios.get(`http://localhost:8080/apis/favourites?customersId=${customersId}`);
      favorites = data;
    } else {
      favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    }

    // ✅ Универсальное определение Set
    const favoriteIds = new Set(
      Array.isArray(favorites)
        ? (typeof favorites[0] === 'object'
            ? favorites.map(f => f.des_id)
            : favorites)
        : []
    );

    // ✅ Обновляем список элементов
    items.value = items.value.map(item => ({
      ...item,
      isFavorite: favoriteIds.has(item.des_id)
    }));
  } catch (error) {
    console.log(error);
  }
};


const addToFavorite = async (item) => {
  const customersId = localStorage.getItem('customersId');

  if (!customersId) {
    // Гостевой пользователь — обновляем избранное локально
    let guestFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    if (!item.isFavorite) {
      guestFavorites.push(item.des_id);
      item.isFavorite = true;
    } else {
      guestFavorites = guestFavorites.filter(id => id !== item.des_id);
      item.isFavorite = false;
    }

    localStorage.setItem('favorites', JSON.stringify(guestFavorites));
  }

  // Логика для авторизованных пользователей
  else {
    try {
      if (!item.isFavorite) {
        const obj = {
          desertId: item.des_id,
          customersId
        };

        item.isFavorite = true;
        const { data } = await axios.post('http://localhost:8080/apis/favourite', obj);
        item.favoriteId = data.favor_id;
      } else {
        item.isFavorite = false;
        await axios.delete('http://localhost:8080/apis/favourite/' + item.favoriteId);
        item.favoriteId = null;
      }

      // Обновляем данные на сервере
      items.value = items.value.map((des) => {
        if (des.des_id === item.des_id) {
          des.isFavorite = item.isFavorite;
          des.favoriteId = item.favoriteId;
        }
        return des;
      });
    } catch (err) {
      console.log(err);
    }
  }
}

const fetchItems = async () => {
  const params = {
    section: filters.sortBy,
    tastes: filters.tastesBy !== 'tastes' ? filters.tastesBy : undefined
  }
  if (filters.searchQuerry) {
    params.title = filters.searchQuerry
  }

  try {
    console.log('🟡 Загружаю десерты...')
    const { data } = await axios.get('http://localhost:8080/apis/des', {
      params
    })
    console.log('✅ Десерты загружены:', data)

    // Тут потенциальная проблема
    console.log('🟡 Загружаю избранное и корзину...')
    const [favoritesRes, basketsRes] = await Promise.all([
      axios.get('http://localhost:8080/apis/favourites'),
      axios.get('http://localhost:8080/apis/baskets')
    ])
    console.log('✅ Избранное и корзина загружены')

    const favorites = favoritesRes.data
    const baskets = basketsRes.data

    const guestFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')

    items.value = data.map((obj) => {
      const isFavorite = favorites.find((fav) => fav.des_id === obj.des_id)
      const inBasket = baskets.find((basket) => basket.des_id === obj.des_id)
      const isGuestFav = guestFavorites.includes(obj.des_id)

      return {
        ...obj,
        isFavorite: !!isFavorite || isGuestFav,
        favoriteId: isFavorite ? isFavorite.favor_id : null,
        isAdded: !!inBasket,
        basketId: inBasket ? inBasket.orders_id : null
      }
    })
  } catch (error) {
    console.error('❌ Ошибка при получении элементов:', error)
  }
}


onMounted(async () => {
  await fetchItems()
  await fetchFavorites()
  await fetchBaskets()
})

watch(() => filters.sortBy, fetchItems)
watch(() => filters.searchQuerry, fetchItems)
watch(() => filters.tastesBy, fetchItems)


provide('cart', { cart, addToBaskets, removeFromCart, onClickAddPlus })

provide('addToFavorite', addToFavorite)
</script>

<template>
  <div class="m-10">
        <!-- <Main /> -->
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
      <!-- Условная отрисовка -->
      <div v-if="items.length === 0" class="flex flex-col items-center text-lg text-gray-600 m-48">
        <img src="../../public/icons/cake.png" alt="cake" class="mb-4" />
        <a class="text-3xl font-mono" for="username">К сожалению, этой категории пока нет.</a>
      </div>
      <Catalog
        v-else
        :items="items"
        @add-to-favorite="addToFavorite"
        :onChangeSearchInput="onChangeSearchInput"
        @add-to-card="onClickAddPlus"
      />
    </div>
  </div>
</template>
