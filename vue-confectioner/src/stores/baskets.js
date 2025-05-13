import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useCartStore = defineStore('cart', () => {
  const baskets = ref([])

  // Загрузка данных корзины
  const loadCart = async () => {
    const customersId = localStorage.getItem('customersId')
    let data = []

    // Если пользователь не авторизован, загружаем корзину для гостя
    if (!customersId) {
      const guestBaskets = JSON.parse(localStorage.getItem('baskets') || '[]')
      if (!guestBaskets.length) return

      const res = await axios.get('http://localhost:8080/apis/des')
      data = res.data
        .filter((d) => guestBaskets.includes(d.des_id))
        .map((d) => ({
          ...d,
          isAdded: true,
          basketId: null,
          quantity: 1,
          weight: 0
        }))
    } else {
      const res = await axios.get(`http://localhost:8080/apis/baskets?customersId=${customersId}`)
      data = res.data.map((d) => ({
        ...d,
        isAdded: true,
        basketId: d.bas_id,
        quantity: d.quantity_des,
        weight: d.final_weight
      }))
    }

    baskets.value = data
  }

  // Добавить или удалить товар из корзины
  const toggleCartItem = async (item) => {
    const customersId = localStorage.getItem('customersId')

    if (!customersId) {
      let guestBaskets = JSON.parse(localStorage.getItem('baskets') || '[]')
      if (!item.isAdded) {
        guestBaskets.push(item.des_id)
        item.isAdded = true
        baskets.value.push(item)
      } else {
        guestBaskets = guestBaskets.filter((id) => id !== item.des_id)
        item.isAdded = false
        baskets.value = baskets.value.filter((basketItem) => basketItem.des_id !== item.des_id)
      }
      localStorage.setItem('baskets', JSON.stringify(guestBaskets))
      return
    }

    if (!item.isAdded) {
      const basketData = {
        desertId: item.des_id,
        finalWeight: item.weight || 0,
        sumPriceList: item.price,
        quantityDes: 1,
        customersId: customersId
      }

      console.log('Sending basketData:', JSON.stringify(basketData, null, 2))
      const res = await axios.post('http://localhost:8080/apis/basket', basketData)

      item.isAdded = true
      item.basketId = res.data.bas_id
      baskets.value.push(item)

      setTimeout(() => {
        baskets.value = baskets.value.filter((basketItem) => basketItem.des_id !== item.des_id)
      }, 300)
    }
  }

  // Обновление количества или веса товара в корзине
  const updateCartItem = async ({ basketId, weight, quantity, price }) => {
    try {
      const item = baskets.value.find((item) => item.bas_id === basketId)
      if (!item) return

      const newSumPrice = weight > 0 ? price : price * quantity

      await axios.post(`http://localhost:8080/apis/baskets/update`, {
        basketId,
        finalWeight: weight,
        quantityDes: quantity,
        sumPriceList: newSumPrice
      })

      item.final_weight = weight
      item.quantity_des = quantity
      item.sum_price_list = newSumPrice
    } catch (error) {
      console.error('Ошибка обновления товара в корзине:', error)
    }
  }

  // Удаление товара из корзины
  const removeFromCart = async (basketId) => {
    try {
      await axios.delete(`http://localhost:8080/apis/basket/${basketId}`)
      baskets.value = baskets.value.filter((item) => item.bas_id !== basketId)
    } catch (error) {
      console.error('Ошибка при удалении товара:', error)
    }
  }

  
  return {
    baskets,
    loadCart,
    toggleCartItem,
    updateCartItem,
    removeFromCart
  }
})
