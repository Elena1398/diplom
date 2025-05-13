// stores/deserts.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDesertStore = defineStore('deserts', () => {
  const items = ref([])

  function setItems(newItems) {
    items.value = newItems
  }

  function updateItemStatus(des_id, updates) {
    const item = items.value.find(i => i.des_id === des_id)
    if (item) Object.assign(item, updates)
  }

  return {
    items,
    setItems,
    updateItemStatus
  }
})
