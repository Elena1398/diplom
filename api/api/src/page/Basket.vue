<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import CatalogItem from '@/components/CardItem.vue'

const baskets = ref([]) // Состояние корзины

const totalPrice = computed(() => baskets.value.reduce((acc, item) => acc + Number(item.price), 0))

const vatPrice = computed(() => Math.round((totalPrice.value * 15) / 100))

const totalBeforeDiscount = computed(() => totalPrice.value - vatPrice.value)

onMounted(async () => {
  try {
    const { data } = await axios.get('http://localhost:8080/apis/baskets')
    console.log('Загруженные данные корзины:', data)
    baskets.value = data
  } catch (err) {
    console.error('Ошибка загрузки корзины:', err)
  }
})

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
          :price="item.price"
          :imageUrl="item.photo"
          :basketId="item.bas_id"
          @remove-item="removeFromCart"
        />
      </div>

      <div class="flex flex-col gap-5 p-16 w-2/4 pr-4 ml-90 my-6">
        <div class="flex gap-2">
          <span>Сумма заказа:</span>
          <div class="flex-1 border-b border-dashed-300"></div>
          <b>{{ totalPrice }} ₽</b>
        </div>
        <div class="flex gap-2">
          <span>Скидка 15%:</span>
          <div class="flex-1 border-b border-dashed-300"></div>
          <b>-{{ vatPrice }} ₽</b>
        </div>
        <div class="flex gap-2">
          <span>Итог:</span>
          <div class="flex-1 border-b border-dashed-300"></div>
          <b>{{ totalBeforeDiscount }} ₽</b>
        </div>
        <button
          disabled
          class="text-white w-full disabled:bg-slate-300 rounded-xl py-4 mt-4 transition cursor-pointer"
        >
          Перейти к оформлению
        </button>
      </div>
    </div>
  </div>
</template>
