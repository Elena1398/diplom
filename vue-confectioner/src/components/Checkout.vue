<script setup>
import { useCartStore } from '@/stores/baskets'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { computed, reactive, watch } from 'vue'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

const totalPrice = computed(() =>
  cartStore.baskets.reduce((acc, item) => acc + Number(item.sum_price_list) || 0, 0)
)
const vatPrice = computed(() => Math.round(totalPrice.value * 0.15))
const totalBeforeDiscount = computed(() => totalPrice.value - vatPrice.value)

const today = new Date()
const minDate = today.toISOString().split('T')[0]

const timeSlots = [
  '10:00 – 12:00',
  '12:00 – 14:00',
  '14:00 – 16:00',
  '16:00 – 18:00',
  '18:00 – 20:00'
]

const order = reactive({
  date: '',
  timeSlot: '',
  deliveryMethod: '',
  paymentMethod: '',
  comment: '',
  cardNumber: '',
  cardExpiry: '',
  cardCVC: ''
})

const errors = reactive({
  cardNumber: '',
  cardExpiry: '',
  cardCVC: ''
})

const timeSlotOptions = computed(() => {
  const currentDate = new Date()
  return timeSlots.map((slot) => {
    const [startTime] = slot.split('–')[0].trim().split(':')
    const slotHour = parseInt(startTime)
    const isToday = order.date === minDate
    const isSlotPast = isToday && slotHour <= currentDate.getHours()
    return { slot, disabled: isSlotPast }
  })
})

watch(
  () => order.date,
  () => {
    const validSlots = timeSlotOptions.value.filter((t) => !t.disabled).map((t) => t.slot)
    if (!validSlots.includes(order.timeSlot)) {
      order.timeSlot = ''
    }
  }
)

const formatCardNumber = () => {
  order.cardNumber = order.cardNumber
    .replace(/\D/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

const formatExpiry = () => {
  order.cardExpiry = order.cardExpiry
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d{1,2})/, '$1/$2')
    .substr(0, 5)
}

const validateCardData = () => {
  errors.cardNumber = ''
  errors.cardExpiry = ''
  errors.cardCVC = ''

  const plainNumber = order.cardNumber.replace(/\s/g, '')
  if (!/^\d{16}$/.test(plainNumber)) {
    errors.cardNumber = 'Введите 16 цифр'
  }

  if (!/^\d{2}\/\d{2}$/.test(order.cardExpiry)) {
    errors.cardExpiry = 'Неверный формат (MM/YY)'
  }

  if (!/^\d{3}$/.test(order.cardCVC)) {
    errors.cardCVC = 'Введите 3 цифры'
  }

  return !(errors.cardNumber || errors.cardExpiry || errors.cardCVC)
}

const submitOrder = async () => {
  if (order.paymentMethod === 'card' && !validateCardData()) return

  const userId = authStore.user?.cus_id || localStorage.getItem('customersId')

  const orderData = {
    cus_id: userId,
    date: order.date,
    timeSlot: order.timeSlot,
    totalPrice: totalBeforeDiscount.value,
    items: cartStore.baskets.map((item) => ({
      des_id: item.des_id, // <-- здесь добавлено des_id
      quantity: item.quantity || 1,
      sum_price_list: item.sum_price_list
    }))
  }

  console.log('Отправляем заказ:', orderData) // для отладки

  try {
    const response = await fetch('http://localhost:8080/apis/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })

    const data = await response.json()

    if (!response.ok) throw new Error(data.message || 'Ошибка при создании заказа')

    // Очистить корзину на сервере
    // Очистить корзину на сервере (новый способ)
    await fetch('http://localhost:8080/apis/baskets/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ customersId: userId }) // userId — ID пользователя
    })

    // Очистить локально
    cartStore.clearCart()

    router.push('/order-success')
  } catch (error) {
    console.error('Ошибка отправки заказа:', error)
    alert('Ошибка при оформлении заказа. Попробуйте снова.')
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(price)
}
</script>

<template>
  <div class="p-8 max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-6 font-mono">Оформление заказа</h1>
    <form @submit.prevent="submitOrder" class="space-y-6">
      <!-- Date -->
      <div>
        <label class="block mb-2 font-semibold">Дата доставки</label>
        <input
          type="date"
          v-model="order.date"
          :min="minDate"
          required
          class="w-full p-3 border rounded-xl"
        />
      </div>

      <!-- Time -->
      <div>
        <label class="block mb-2 font-semibold">Время доставки</label>
        <select v-model="order.timeSlot" required class="w-full p-3 border rounded-xl">
          <option disabled value="">Выберите интервал</option>
          <option
            v-for="slot in timeSlotOptions"
            :key="slot.slot"
            :value="slot.slot"
            :disabled="slot.disabled"
          >
            {{ slot.slot }} <span v-if="slot.disabled">(недоступно)</span>
          </option>
        </select>
      </div>

      <!-- Delivery Method -->
      <div>
        <label class="block mb-2 font-semibold">Способ доставки</label>
        <div class="flex gap-4">
          <div
            :class="[
              'cursor-pointer px-4 py-3 rounded-xl border w-full text-center transition',
              order.deliveryMethod === 'courier'
                ? 'bg-lilac text-white border-lilac'
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
            ]"
            @click="order.deliveryMethod = 'courier'"
          >
            Курьерская доставка
          </div>

          <div
            :class="[
              'cursor-pointer px-4 py-3 rounded-xl border w-full text-center transition',
              order.deliveryMethod === 'pickup'
                ? 'bg-lilac text-white border-lilac'
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
            ]"
            @click="order.deliveryMethod = 'pickup'"
          >
            Самовывоз
          </div>
        </div>
      </div>

      <!-- Payment Method -->
      <div>
        <label class="block mb-2 font-semibold">Способ оплаты</label>
        <div class="flex gap-4">
          <div
            :class="[
              'cursor-pointer px-4 py-3 rounded-xl border w-full text-center transition',
              order.paymentMethod === 'card'
                ? 'bg-lilac text-white border-lilac'
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
            ]"
            @click="order.paymentMethod = 'card'"
          >
            Картой онлайн
          </div>

          <div
            :class="[
              'cursor-pointer px-4 py-3 rounded-xl border w-full text-center transition',
              order.paymentMethod === 'cash'
                ? 'bg-lilac text-white border-lilac'
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
            ]"
            @click="order.paymentMethod = 'cash'"
          >
            Наличными
          </div>
        </div>
      </div>

      <!-- Card Info -->
      <div v-if="order.paymentMethod === 'card'" class="space-y-4">
        <div>
          <label class="block mb-1 font-semibold">Номер карты</label>
          <input
            type="text"
            v-model="order.cardNumber"
            maxlength="19"
            placeholder="0000 0000 0000 0000"
            class="w-full p-3 border rounded-xl"
            @input="formatCardNumber"
          />
          <p v-if="errors.cardNumber" class="text-red-500 text-sm mt-1">{{ errors.cardNumber }}</p>
        </div>
        <div class="flex gap-4">
          <div class="w-1/2">
            <label class="block mb-1 font-semibold">Срок (MM/YY)</label>
            <input
              type="text"
              v-model="order.cardExpiry"
              maxlength="5"
              placeholder="12/25"
              class="w-full p-3 border rounded-xl"
              @input="formatExpiry"
            />
            <p v-if="errors.cardExpiry" class="text-red-500 text-sm mt-1">
              {{ errors.cardExpiry }}
            </p>
          </div>
          <div class="w-1/2">
            <label class="block mb-1 font-semibold">CVC</label>
            <input
              type="text"
              v-model="order.cardCVC"
              maxlength="3"
              placeholder="123"
              class="w-full p-3 border rounded-xl"
            />
            <p v-if="errors.cardCVC" class="text-red-500 text-sm mt-1">{{ errors.cardCVC }}</p>
          </div>
        </div>
      </div>

      <!-- Comment -->
      <div>
        <label class="block mb-2 font-semibold">Комментарий</label>
        <textarea
          v-model="order.comment"
          class="w-full p-3 border rounded-xl resize-none"
          rows="3"
          placeholder="Например, позвоните за 10 минут до приезда"
        ></textarea>
      </div>

      <!-- Summary -->
      <div class="bg-gray-100 p-6 rounded-xl">
        <div class="flex justify-between mb-2">
          <span>Сумма заказа:</span>
          <b>{{ formatPrice(totalPrice) }}</b>
        </div>
        <div class="flex justify-between mb-2">
          <span>Скидка:</span>
          <b>-{{ formatPrice(vatPrice) }}</b>
        </div>
        <div class="flex justify-between text-xl font-bold">
          <span>Итого:</span>
          <b>{{ formatPrice(totalBeforeDiscount) }}</b>
        </div>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        class="w-full py-4 bg-lilac text-white rounded-xl hover:bg-purple-700 transition active:scale-95"
      >
        Подтвердить заказ
      </button>
    </form>
  </div>
</template>
