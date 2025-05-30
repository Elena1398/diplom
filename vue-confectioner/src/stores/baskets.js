import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useCartStore = defineStore('cart', () => {
  const baskets = ref([])

  const normalizeItem = (d, fromGuest = false) => {
    const quantity = d.quantity_des || 1
    const weight = d.final_weight || 0
    const price = Number(d.price) || 0
    const sum_price_list = Number(d.sum_price_list) || 0 // <-- фикс тут

    return {
      ...d,
      des_id: d.des_id ?? d.desertId,
      isAdded: true,
      basketId: fromGuest ? null : (d.bas_id ?? null),
      quantity,
      weight,
      price,
      sum_price_list
    }
  }

  // Загрузка данных корзины
  const loadCart = async () => {
    const customersId = localStorage.getItem('customersId')
    let data = []

    if (!customersId) {
      const guestBaskets = JSON.parse(localStorage.getItem('baskets') || '[]')
      if (!guestBaskets.length) return

      const res = await axios.get('http://localhost:8080/apis/des')
      data = res.data
        .filter((d) => guestBaskets.includes(d.des_id))
        .map((d) => {
          const itemKey = `cart-item-${d.des_id}`
          const saved = JSON.parse(localStorage.getItem(itemKey) || '{}')
          const weight = saved.weight || 0
          const quantity = saved.quantity || 1
          const price = saved.price || Number(d.price) || 0
         const isCake = d.title?.toLowerCase().includes('торт')
const sum_price_list = isCake ? price : price * quantity


          return normalizeItem(
            {
              ...d,
              final_weight: weight,
              quantity_des: quantity,
              price,
              sum_price_list
            },
            true
          )
        })
    } else {
      const res = await axios.get(`http://localhost:8080/apis/baskets?customersId=${customersId}`)
      data = res.data.map(normalizeItem)
    }

    baskets.value = data
  }

  // Добавить или удалить товар из корзины
  const toggleCartItem = async (item) => {
    const customersId = localStorage.getItem('customersId')

    const removeItem = () => {
      item.isAdded = false
      baskets.value = baskets.value.filter((i) => i.des_id !== item.des_id)
    }

    const addItem = (newItem) => {
      newItem.isAdded = true
      baskets.value.push(normalizeItem(newItem))
    }

    if (!customersId) {
      let guestBaskets = JSON.parse(localStorage.getItem('baskets') || '[]')

      if (!item.isAdded) {
        guestBaskets.push(item.des_id)
        localStorage.setItem('baskets', JSON.stringify(guestBaskets))
        addItem(item)
      } else {
        guestBaskets = guestBaskets.filter((id) => id !== item.des_id)
        localStorage.setItem('baskets', JSON.stringify(guestBaskets))
        removeItem()
      }
      await loadCart()
      return
    }

    if (!item.isAdded) {
      const basketData = {
        desertId: item.des_id,
        finalWeight: item.weight || 0,
        sumPriceList: item.price,
        quantityDes: 1,
        customersId
      }

      const res = await axios.post('http://localhost:8080/apis/basket', basketData)
      addItem({ ...item, bas_id: res.data.bas_id })
    } else {
      await removeFromCart(item.basketId)
    }
  }

  // Обновление количества или веса товара в корзине
  const updateCartItem = async ({ basketId, weight, quantity, price }) => {
    try {
      const item = baskets.value.find((i) => i.basketId === basketId)
      if (!item) return

      const sumPrice = weight > 0 ? price : price * quantity

      await axios.put(`http://localhost:8080/apis/baskets/update/${basketId}`, {
        desertId: console.log(
          'des_id для updateCartItemsBulk:',
          item.basketId,
          baskets.value.find((b) => b.basketId === item.basketId)?.des_id
        ),
        finalWeight: weight,
        quantityDes: quantity,
        sumPriceList: sumPrice
      })

      Object.assign(item, {
        weight,
        quantity,
        sum_price_list: sumPrice
      })
    } catch (e) {
      console.error('Ошибка обновления товара:', e)
    }
  }

  const updateCartItemsBulk = async (items) => {
    try {
      if (!Array.isArray(items)) {
        items = [items]
      }

      for (const item of items) {
        const pricePerUnit =
          item.price || baskets.value.find((b) => b.basketId === item.basketId)?.price || 0
        const sumPrice = item.weight > 0 ? pricePerUnit : pricePerUnit * item.quantity

        await axios.post(`http://localhost:8080/apis/baskets/update`, {
          basketId: item.basketId,
          finalWeight: item.weight,
          quantityDes: item.quantity,
          sumPriceList: sumPrice
        })

        // После успешного запроса обновляем локальное состояние прямо здесь
        const index = baskets.value.findIndex((b) => b.basketId === item.basketId)
        if (index !== -1) {
          baskets.value[index] = {
            ...baskets.value[index],
            weight: item.weight,
            quantity: item.quantity,
            sum_price_list: sumPrice
          }
        }
      }
      await loadCart()
    } catch (e) {
      console.error('Ошибка обновления нескольких товаров:', e)
    }
  }

  // Удаление товара из корзины
  const removeFromCart = async (basketId, desId = null) => {
    const customersId = localStorage.getItem('customersId')

    if (!customersId) {
      let guestBaskets = JSON.parse(localStorage.getItem('baskets') || '[]')
      guestBaskets = guestBaskets.filter((id) => id !== desId)
      localStorage.setItem('baskets', JSON.stringify(guestBaskets))
      baskets.value = baskets.value.filter((item) => item.des_id !== desId)
      return
    }

    try {
      await axios.delete(`http://localhost:8080/apis/basket/${basketId}`)
      baskets.value = baskets.value.filter((item) => item.bas_id !== basketId)
      await loadCart()
    } catch (error) {
      console.error('Ошибка при удалении товара:', error)
    }
  }

  const clearCart = () => {
    baskets.value = []
    localStorage.removeItem('cart') // удаляем и локальное хранилище для гостя
  }

  return {
    baskets,
    loadCart,
    toggleCartItem,
    updateCartItem,
    updateCartItemsBulk,
    removeFromCart,
    clearCart
  }
})
