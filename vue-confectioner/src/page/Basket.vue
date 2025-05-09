<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import CatalogItem from '@/components/CardItem.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

onMounted(() => {
  auth.loadUserFromLocalStorage()
})

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}

const baskets = ref([]) // Состояние корзины
const isAuthenticated = computed(() => !!auth.user)
const showModal = ref(false)



const totalPrice = computed(() =>
  baskets.value.reduce((acc, item) => acc + Number(item.sum_price_list), 0)
)

const vatPrice = computed(() => {
  return Math.round(totalPrice.value * 0.15)
})

const totalBeforeDiscount = computed(() => {
  return totalPrice.value - vatPrice.value
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(price)
}

const handleOrderClick = () => {
  if (!isAuthenticated.value) {
    showModal.value = true
    return
  }
}

onMounted(() => {
  const user = localStorage.getItem('customers')
  isAuthenticated.value = !!user
})

const updateItem = async ({ basketId, weight, quantity, price }) => {
  try {
    const item = baskets.value.find((item) => item.bas_id === basketId)
    if (!item) return

    // Вычисляем сумму: пирог — price, конфеты — price * quantity
    const newSumPrice = weight > 0 ? price : price * quantity

    // Обновляем на сервере
    await axios.post(`http://localhost:8080/apis/baskets/update`, {
      basketId,
      finalWeight: weight,
      quantityDes: quantity,
      sumPriceList: newSumPrice
    })

    // Локальное обновление — важно, иначе computed не обновится
    item.final_weight = weight
    item.quantity_des = quantity
    item.sum_price_list = newSumPrice
  } catch (error) {
    console.error('Ошибка обновления товара в корзине:', error)
  }
}

onMounted(async () => {
  try {
    const { data } = await axios.get('http://localhost:8080/apis/baskets')
    console.log('Загруженные данные корзины:', data)
    baskets.value = data
  } catch (err) {
    console.error('Ошибка загрузки корзины:', err)
  }
})

const getItemPrice = (item) => {
  if (!item) return 0
  const quantity = Number(item.quantity_des)
  const weight = Number(item.final_weight)
  const sum = Number(item.sum_price_list)

  if (weight > 0) return sum // пирог — цена уже точная
  if (quantity > 0) return sum / quantity
  return 0
}

const removeFromCart = async (basketId) => {
  try {
    await axios.delete(`http://localhost:8080/apis/basket/${basketId}`)
    baskets.value = baskets.value.filter((item) => item.bas_id !== basketId)
  } catch (error) {
    console.error('Ошибка при удалении товара:', error)
  }
}
</script>

<template>
  <div class="p-16">
    <div class="flex">
      <div class="w-1/2 pr-4 mb-5">
        <h2 class="text-3xl mb-8 font-mono">Корзина</h2>
        <CatalogItem
          v-for="item in baskets"
          :key="item.bas_id"
          :code="item.des_id"
          :title="item.des_name"
          :price="getItemPrice(item)"
          :imageUrl="item.photo"
          :basketId="item.bas_id"
          :weight="Number(item.final_weight)"
          :quantity="item.quantity_des"
          @remove-item="removeFromCart"
          @update-item="updateItem"
        />
      </div>
      <div class="flex flex-col gap-5 p-16 w-2/4 pr-4 my-6">
        <div class="flex gap-2">
          <span>Сумма заказа:</span>
          <div class="flex-1 border-b border-dashed-300"></div>
          <b>{{ formatPrice(totalPrice) }}</b>
        </div>
        <div class="flex gap-2">
          <span>Скидка 15%:</span>
          <div class="flex-1 border-b border-dashed-300"></div>
          <b>-{{ formatPrice(vatPrice) }}</b>
        </div>
        <div class="flex gap-2">
          <span>Итог:</span>
          <div class="flex-1 border-b border-dashed border-gray-300"></div>
          <b>{{ formatPrice(totalBeforeDiscount) }}</b>
        </div>
        <div>
          <button
            :disabled="!totalPrice"
            @click="handleOrderClick"
            class="text-white w-full bg-lilac disabled:bg-slate-300 rounded-xl py-4 mt-4 transition cursor-pointer"
          >
            Перейти к оформлению
          </button>

          <!-- Модальное окно -->
          <div
            v-if="showModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div class="bg-white p-8 rounded-xl max-w-md w-full shadow-lg">
              <h3 class="text-xl font-bold mb-4 flex items-center justify-center">
                Требуется авторизация
              </h3>
              <p class="mb-6">Чтобы оформить заказ, пожалуйста, войдите в аккаунт или зарегистрируйтесь.</p>
              <div class="flex justify-end gap-4">
                <button
                  @click="showModal = false"
                  class="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400"
                >
                  Отмена
                </button>
                <button
                  @click="goToLogin"
                  class="px-4 py-2 rounded-xl bg-lilac text-white hover:bg-purple-700"
                >
                Войти</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
