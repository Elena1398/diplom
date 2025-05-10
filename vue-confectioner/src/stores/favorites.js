import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref([])

  const loadFavorites = async () => {
    const customersId = localStorage.getItem('customersId')
    let data = []

    // Загружаем десерты, если нужно
    if (!customersId) {
      const guestFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      if (!guestFavorites.length) return

      const res = await axios.get('http://localhost:8080/apis/des')
      data = res.data.filter((d) => guestFavorites.includes(d.des_id)).map((d) => ({
        ...d,
        isFavorite: true,
        favoriteId: null
      }))
    } else {
      const res = await axios.get(`http://localhost:8080/apis/favourites?customersId=${customersId}`)
      data = res.data.map((d) => ({
        ...d,
        isFavorite: true,
        favoriteId: d.favor_id
      }))
    }

    // Загружаем корзину и проставляем флаги
    const { data: baskets } = await axios.get('http://localhost:8080/apis/baskets')
    favorites.value = data.map((dessert) => {
      const basketItem = baskets.find((b) => b.des_id === dessert.des_id)
      return {
        ...dessert,
        isAdded: !!basketItem,
        basketId: basketItem?.bas_id || null
      }
    })
  }

  const toggleFavorite = async (item) => {
    const customersId = localStorage.getItem('customersId')

    if (!customersId) {
      let guestFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      if (!item.isFavorite) {
        guestFavorites.push(item.des_id)
        item.isFavorite = true
        favorites.value.push(item)
      } else {
        guestFavorites = guestFavorites.filter((id) => id !== item.des_id)
        item.isFavorite = false
        favorites.value = favorites.value.filter((fav) => fav.des_id !== item.des_id)
      }
      localStorage.setItem('favorites', JSON.stringify(guestFavorites))
      return
    }

    if (!item.isFavorite) {
      const res = await axios.post('http://localhost:8080/apis/favourite', {
        desertId: item.des_id,
        customersId
      })
      item.isFavorite = true
      item.favoriteId = res.data.favor_id
      favorites.value.push(item)
    } else {
      if (!item.favoriteId) {
        console.warn('favoriteId не найден — невозможно удалить с сервера')
        return
      }

      await axios.delete('http://localhost:8080/apis/favourite/' + item.favoriteId)
      item.isFavorite = false
      item.isRemoving = true

      setTimeout(() => {
        favorites.value = favorites.value.filter((fav) => fav.des_id !== item.des_id)
      }, 300)
    }
  }

  const toggleCartInFavorites = async (item) => {
    if (!item.isAdded) {
      const obj = {
        desertId: item.des_id,
        finalWeight: item.weight || 0,
        sumPriceList: item.price,
        quantityDes: 1
      }

      const { data } = await axios.post('http://localhost:8080/apis/basket', obj)
      item.isAdded = true
      item.basketId = data.bas_id
    } else {
      await axios.delete('http://localhost:8080/apis/basket/' + item.basketId)
      item.isAdded = false
      item.basketId = null
    }

    // Обновляем объект в списке избранного
    favorites.value = favorites.value.map((fav) =>
      fav.des_id === item.des_id ? { ...fav, ...item } : fav
    )
  }

  return {
    favorites,
    loadFavorites,
    toggleFavorite,
    toggleCartInFavorites
  }
})
