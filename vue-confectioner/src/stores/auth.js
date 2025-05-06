import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    cus_id: null,
    user: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.cus_id,
  },

  actions: {
    setUser(userData) {
      this.cus_id = userData.cus_id
      this.user = userData

      localStorage.setItem('customersId', userData.cus_id)
      localStorage.setItem('user', JSON.stringify(userData)) // ✅ сохраняем всё
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
        const userData = JSON.parse(storedUser)
        this.user = userData
        this.cus_id = userData.cus_id
      } else {
        // Резервная попытка — по ID
        const userId = localStorage.getItem('customersId')
        if (userId) {
          axios.get(`http://localhost:8080/apis/customer/${userId}`)
            .then(response => {
              this.setUser(response.data)
            })
            .catch(error => {
              console.warn('Не удалось загрузить данные пользователя:', error.message)
            })
        }
      }
    }
  }
})
