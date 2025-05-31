<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import CatalogItem from '@/components/CardItem.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/baskets'

// Сторы
const BasStore = useCartStore()
const auth = useAuthStore()
const router = useRouter()

// Модальное окно
const showModal = ref(false)

// Загрузка корзины и пользователя
onMounted(() => {
  auth.loadUserFromLocalStorage()
  BasStore.loadCart()
})

// Используем только данные из стора
const baskets = computed(() => BasStore.baskets)
const isAuthenticated = computed(() => !!auth.user)
const hasBasket = computed(() => baskets.value.length > 0)

const totalPrice = computed(() => baskets.value.reduce((acc, item) => acc + getItemPrice(item), 0))

const vatPrice = computed(() => Math.round(totalPrice.value * 0.15))

const totalBeforeDiscount = computed(() => totalPrice.value - vatPrice.value)

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
  router.push('/checkout') 
}

const goToLogin = () => {
  router.push('/login')
}

const getItemPrice = (item) => Number(item.sum_price_list) || 0

const removeFromCart = BasStore.removeFromCart
const updateCartItemsBulk = BasStore.updateCartItemsBulk

watch(baskets, (newVal) => {
  console.log('Текущее содержимое baskets:')
  newVal.forEach((item) => {
    console.log({
      title: item.des_name,
      sum_price_list: item.sum_price_list,
      quantity_des: item.quantity_des,
      final_weight: item.final_weight,
      type_weight: typeof item.final_weight
    })
  })
})

onMounted(async () => {
  if (auth.user || localStorage.getItem('customersId')) {
    await BasStore.loadCart()
  } else {
    BasStore.clearCart()
  }
})


</script>

<template>
  <div class="p-16">
    <div class="flex">
      <div class="w-1/2 pr-4 mb-5">
        <h2 class="text-3xl mb-8 font-mono">Корзина</h2>
        <div v-if="!hasBasket" class="flex flex-col items-center text-lg text-gray-600 m-48">
          <img src="../../public/icons/cake.png" alt="cake" class="mb-4" />
          <a class="text-3xl font-mono">Корзина пуста</a>
          <p class="font-mono text-slate-400">Отправляйтесь за покупками</p>
        </div>
        <div v-else>
          <CatalogItem
            v-for="item in baskets"
            :key="item.bas_id"
            :code="item.des_id"
            :title="item.des_name"
            :price="getItemPrice(item)"
            :imageUrl="item.photo"
            :basketId="item.bas_id"
            :weight="Number(item.final_weight) || 1000"
            :quantity="Number(item.quantity_des) || 1"
            :isFromCart="true"
            @remove-item="removeFromCart"
            @update-item="
              (item) => {
                item.sum_price_list = item.weight > 0 ? item.price : item.price * item.quantity

                updateCartItemsBulk([item])
              }
            "
          />
        </div>
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
            class="text-white w-full bg-lilac disabled:bg-slate-300 rounded-xl py-4 mt-4 transition cursor-pointer hover:bg-purple-600 active:scale-90 transition-transform duration-300"
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
              <p class="mb-6">
                Чтобы оформить заказ, пожалуйста, войдите в аккаунт или зарегистрируйтесь.
              </p>
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
                  Войти
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
