<script setup>
import { onMounted } from 'vue'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { useAuthStore } from '@/stores/auth'
import Maps from './Map.vue'

const auth = useAuthStore()

onMounted(() => {
  auth.loadUserFromLocalStorage()
})

// Инициализация AOS (анимации)
onMounted(() => {
  AOS.init({
    duration: 1000, // Длительность анимации (в миллисекундах)
    once: true, // Анимация срабатывает один раз
    easing: 'ease-in-out' // Плавность анимации
  })
})
</script>

<template>
  <div>
    <!-- Заголовок страницы -->
    <div
      class="bg-gradient-to-b from-orange-400/50 mx-auto w-full h-64 flex items-center justify-center"
      data-aos="fade-down"
    >
      <h1 class="text-6xl text-white font-serif text-center mb-8 p-4">Доставка и Оплата</h1>
    </div>

    <section class="m-40 mt-10">
      <!-- 01 -->
      <div class="flex items-center space-x-6 relative" data-aos="fade-up">
        <h1 class="text-9xl font-serif text-light_orange mb-8 p-4" style="font-size: 18rem">01</h1>
        <div class="absolute left-10 pt-10 p-1">
          <h2 class="text-2xl">ВЫБЕРИТЕ ТОВАРЫ</h2>
          <p class="text-lg text-gray-600">
            В каталоге выберите необходимые Вам товары, добавьте их в корзину.
          </p>
        </div>
      </div>

      <!-- 02 -->
      <div class="flex items-center space-x-6 relative justify-end" data-aos="fade-left">
        <h1 class="text-9xl font-serif text-light_orange mb-8 p-4" style="font-size: 18rem">02</h1>
        <div class="absolute right-10 pt-10 p-5 text-right">
          <h2 class="text-2xl">ОФОРМИТЕ ЗАКАЗ</h2>
          <p class="text-lg text-gray-600">
            Перейдите в корзину и оформите заказ, выберите способ доставки и оплаты.
          </p>
        </div>
      </div>

      <!-- 03 -->
      <div class="flex items-center space-x-6 relative" data-aos="fade-up">
        <h1 class="text-9xl font-serif text-light_orange mb-8 p-4" style="font-size: 18rem">03</h1>
        <div class="absolute left-10 pt-10 p-1">
          <h2 class="text-2xl">ОЖИДАЙТЕ ОТВЕТ</h2>
          <p class="text-lg text-gray-600">
            Я свяжусь с Вами предпочтительным для Вас способом для подтверждения заказа, уточнения
            условий доставки и оплаты.
          </p>
        </div>
      </div>
    </section>

    <!-- Информационная доска -->
    <section class="container mx-auto p-10" data-aos="fade-up">
      <div class="grid grid-cols-2 gap-10 items-stretch">
        <!-- Левая колонка: Доставка -->
        <div class="bg-white rounded-lg shadow-xl flex flex-col p-10 w-full">
          <h2 class="text-6xl text-gray-800 font-serif text-center">Способы доставки</h2>
          <ul class="text-lg text-gray-600">
            <li class="mt-6">
              <span class="text-2xl font-serif block">Самовывоз:</span>
              <p class="text-xl mt-2">
                Вы можете забрать ваш заказ самостоятельно с нашего пункта выдачи.
              </p>
            </li>
            <li class="mt-6">
              <span class="text-2xl font-serif block">Доставка:</span>
              <p class="text-xl mt-2">
                Мы доставим ваш заказ прямо к двери. Сроки и стоимость доставки зависят от вашего
                местоположения.
              </p>
            </li>
          </ul>
        </div>

        <!-- Правая колонка: Оплата -->
        <div class="bg-white rounded-lg shadow-xl flex flex-col p-10 w-full">
          <h2 class="text-6xl text-gray-800 font-serif text-center">Способы оплаты</h2>
          <ul class="text-lg text-gray-600">
            <li class="mt-6">
              <span class="text-2xl font-serif block">Наличные:</span>
              <p class="text-xl mt-2">Вы можете оплатить заказ наличными курьеру при получении.</p>
            </li>
            <li class="mt-6">
              <span class="text-2xl font-serif block">Перевод на карту:</span>
              <p class="text-xl mt-2">
                Вы можете оплатить заказ банковским переводом на нашу карту.
              </p>
            </li>
            <li class="mt-6">
              <span class="text-2xl font-serif block">СПБ:</span>
              <p class="text-xl mt-2">
                Оплата через систему СПБ для безопасных и быстрых транзакций.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>
    <div class="m-40 mt-10">
      <Maps />
    </div>
  </div>
</template>
