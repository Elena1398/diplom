import { defineStore } from 'pinia'
import axios from 'axios'
import { useCartStore } from './baskets'
import { useFavoritesStore } from './favorites'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    cus_id: null,
    user: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.user.role
  },

  actions: {
    sanitizeUserData(userData) {
      if (!userData) {
        throw new Error('userData не определён')
      }

      const id = userData.cus_id ?? userData.admin_id

      if (!id) {
        localStorage.removeItem('user')
        localStorage.removeItem('customersId')
        localStorage.removeItem('role')
        throw new Error('userData не содержит ID')
      }

      const role = userData.role ?? (userData.admin_id ? 'admin' : 'customer')

      return {
        ...userData,
        cus_id: userData.cus_id ?? null,
        admin_id: userData.admin_id ?? null,
        role
      }
    },

    async setUser(userData) {
      console.log('📥 Сохраняем пользователя:', userData)

      const cleanData = this.sanitizeUserData(userData)
      this.cus_id = cleanData.cus_id
      this.user = cleanData

      localStorage.setItem('customersId', cleanData.cus_id)
      localStorage.setItem('role', cleanData.role)
      localStorage.setItem('user', JSON.stringify(cleanData))

      // ⬇️ Очищаем гостевую корзину
      localStorage.removeItem('baskets')
      localStorage.removeItem('favorites')

      await this.mergeGuestFavorites()
    },

    logout() {
      this.cus_id = null
      this.user = null
      localStorage.removeItem('customersId')
      localStorage.removeItem('user')
      useCartStore().clearCart()
      useFavoritesStore().clearFavorites()
    },

    async loadUserFromLocalStorage() {
      const storedUser = localStorage.getItem('user')

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          const sanitized = this.sanitizeUserData(parsed)
          await this.setUser(sanitized)
        } catch (e) {
          console.warn('⚠️ Ошибка парсинга user из localStorage:', e)
        }
      } else {
        const customersId = localStorage.getItem('customersId')
        if (!customersId) {
          console.warn('📭 customersId отсутствует в localStorage')
        } else if (/^\d+$/.test(customersId) && Number(customersId) <= 2147483647) {
          console.log(`📡 Пытаемся загрузить пользователя по ID: ${customersId}`)
          try {
            const { data } = await axios.get(`http://localhost:8080/apis/customer/${customersId}`)
            const sanitized = this.sanitizeUserData(data)
            await this.setUser(sanitized)
          } catch (error) {
            console.error(
              '❌ Не удалось загрузить данные пользователя:',
              error.response?.data || error.message
            )
          }
        } else {
          console.warn('⚠️ Некорректный или слишком большой customersId:', customersId)
          localStorage.removeItem('customersId')
        }
      }
    },

    async mergeGuestFavorites() {
      const guestFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      if (guestFavorites.length === 0) return

      const customersId = this.cus_id
      if (!customersId) {
        console.warn('⚠️ mergeGuestFavorites вызван без customersId')
        return
      }

      try {
        const { data: serverFavorites } = await axios.get(
          `http://localhost:8080/apis/favourites?customersId=${customersId}`
        )

        const serverIds = serverFavorites.map((f) => f.des_id)
        const toAdd = guestFavorites.filter((id) => !serverIds.includes(id))

        await Promise.all(
          toAdd.map((desertId) =>
            axios.post('http://localhost:8080/apis/favourite', {
              desertId,
              customersId
            })
          )
        )

        localStorage.removeItem('favorites')
      } catch (err) {
        console.error('❌ Ошибка при объединении избранного:', err)
      }
    }
  }
})
