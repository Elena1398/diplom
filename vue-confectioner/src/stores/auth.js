import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    cus_id: null,
    user: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.cus_id
  },

  actions: {
    async setUser(userData) {
      this.cus_id = userData.cus_id
      this.user = userData

      localStorage.setItem('customersId', userData.cus_id)
      localStorage.setItem('user', JSON.stringify(userData))

      // 🔄 Слияние избранного после входа
      await this.mergeGuestFavorites()
    },

    logout() {
      this.cus_id = null
      this.user = null
      localStorage.removeItem('customersId')
      localStorage.removeItem('user')
    },

    loadUserFromLocalStorage() {
      const storedUser = localStorage.getItem('user')

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          if (userData && Number.isInteger(userData.cus_id)) {
            this.setUser(userData)
          } else {
            throw new Error('userData не содержит валидный cus_id')
          }
        } catch (e) {
          console.warn('Ошибка парсинга user из localStorage:', e)
        }
      } else {
        const customersId = localStorage.getItem('customersId')
        if (!customersId) {
          console.warn('customersId отсутствует в localStorage')
        } else if (/^\d+$/.test(customersId) && Number(customersId) <= 2147483647) {
          console.log(`Пытаемся загрузить пользователя с ID: ${customersId}`)
          axios
            .get(`http://localhost:8080/apis/customer/${customersId}`)
            .then((response) => {
              this.setUser(response.data)
            })
            .catch((error) => {
              console.error(
                'Не удалось загрузить данные пользователя:',
                error.response?.data || error.message
              )
            })
        } else {
          console.warn('Некорректный или слишком большой customersId в localStorage:', customersId)
          localStorage.removeItem('customersId')
        }
      }
    },

    // 🧩 Функция объединения избранного
    async mergeGuestFavorites() {
      const guestFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      if (guestFavorites.length === 0) return
    
      const customersId = this.cus_id
      if (!customersId) {
        console.warn('mergeGuestFavorites вызван без customersId')
        return
      }
    
      try {
        const { data: serverFavorites } = await axios.get(
          `http://localhost:8080/apis/favourites?customersId=${customersId}`
        )
    
        const serverIds = serverFavorites.map(f => f.des_id)
        const toAdd = guestFavorites.filter(id => !serverIds.includes(id))
    
        await Promise.all(
          toAdd.map(desertId =>
            axios.post('http://localhost:8080/apis/favourite', {
              desertId,
              customersId
            })
          )
        )
    
        localStorage.removeItem('favorites')
      } catch (err) {
        console.error('Ошибка при объединении избранного:', err)
      }
    }    
  }
})
