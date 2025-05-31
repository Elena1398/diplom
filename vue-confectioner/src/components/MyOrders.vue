<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import OrderCard from '@/components/OrderCard.vue' // твоя карточка товара

const orders = ref([])
const customerId = localStorage.getItem('customersId') // или другой способ получить ID клиента

const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(price)
}

onMounted(async () => {
  if (!customerId) return
  try {
    const { data } = await axios.get(`http://localhost:8080/apis/my-orders/${customerId}`)
    orders.value = data
  } catch (e) {
    console.error('Ошибка загрузки заказов:', e)
  }
})
</script>

<template>
  <div class="p-16">
    <h2 class="text-3xl mb-8 font-mono">Мои заказы</h2>

    <div v-if="orders.length === 0" class="text-gray-600">У вас пока нет заказов</div>

    <div v-for="order in orders" :key="order.orders_id" class="mb-12">
      <div class="mb-4 p-4 border rounded-md bg-gray-50">
        <div class="flex justify-between items-center">
          <div>
            <div>
              Дата: <b>{{ formatDate(order.data_orders) }}</b>
            </div>
            <div>
              Время: <b>{{ order.time_orsers }}</b>
            </div>
          </div>
          <div class="text-xl font-semibold">Сумма заказа: {{ formatPrice(order.summa) }}</div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-5">
        <OrderCard
          v-for="item in order.items"
          :key="item.bas_id"
          :item="item"
          :isFromCart="false"
        />
      </div>
    </div>
  </div>
</template>
