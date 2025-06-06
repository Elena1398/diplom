<script setup>
import { onMounted } from 'vue'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Галерея — правильный способ обращения к папке public
const gallery = [
  '/gallery/IMG_20250604_211216.jpg',
  '/gallery/IMG_20250604_211231.jpg',
  '/gallery/IMG_20250604_211246.jpg',
  '/gallery/IMG_20250604_211300.jpg',
  '/gallery/IMG_20250604_211336.jpg',
  '/gallery/IMG_20250604_211516.jpg'
]

const courses = [
  '../../public/courses/IMG-20250530-WA0000.jpg',
  '../../public/courses/IMG-20250530-WA0001.jpg',
  '../../public/courses/IMG-20250530-WA0003.jpg',
  '../../public/courses/IMG-20250530-WA0004.jpg',
  '../../public/courses/IMG-20250530-WA0005.jpg',
  '../../public/courses/IMG-20250530-WA0006.jpg'
]


onMounted(() => {
  AOS.init({
    duration: 1000,
    once: true,
    easing: 'ease-in-out'
  })
})
</script>

<template>
  <div>
    <!-- Заголовок страницы -->
    <div
      class="bg-gradient-to-b from-orange-400/50 mx-auto mb-40 w-full h-64 flex items-center justify-center"
      data-aos="fade-down"
    >
      <h1 class="text-6xl text-white font-serif text-center mb-8 p-4">О кондитере</h1>
    </div>
    <!-- Факты о кондитере -->
    <section class="bg-pink-50 py-20" data-aos="fade-up">
      <div class="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
        <div>
          <h2 class="text-4xl font-serif text-orange-500 mb-6">Немного обо мне</h2>
          <p class="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
            Меня зовут Валентина. Кондитерской начала заниматься 8 лет назад. Сделала торт на 1 год
            моего сына Ване — гостям очень понравился торт. Потом они стали потихоньку заказывать торты и
            рассказывать своим друзьям. <br /><br />
            Я поняла, что могу заниматься тем, что нравится, и за это получать деньги. Стала
            углубляться в кондитерское дело, изучала много информации, ходила на различные
            мастер-классы: по тортам, пирожным, конфетам, макаронс, кексам, муссовым тортам и
            пирожным, куличам, моти и т.д.
          </p>
        </div>
        <div class="grid gap-4 text-gray-700">
          <div class="bg-white p-6 rounded-xl shadow-md">
            <h3 class="text-xl font-semibold text-orange-500">300+ заказов</h3>
            <p>Сделано более 300 тортов и десертов</p>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-md">
            <h3 class="text-xl font-semibold text-orange-500">Натуральные ингредиенты</h3>
            <p>Без консервантов и искусственных добавок</p>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-md">
            <h3 class="text-xl font-semibold text-orange-500">Индивидуальный подход</h3>
            <p>Каждый десерт создаётся под вкусы и пожелания клиента</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Галерея -->
    <section class="container mx-auto my-20 px-10" data-aos="fade-up">
      <h2 class="text-4xl font-serif text-center text-orange-700 mb-10">Галерея работ</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <img
          v-for="(image, index) in gallery"
          :key="index"
          :src="image"
          alt="cake"
          class="w-full h-64 object-cover object-center rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
        />
      </div>
    </section>
    <!-- Блок: Философия -->
    <section class="m-20 mt-16" data-aos="fade-up">
      <div class="bg-white shadow-xl rounded-2xl p-10 max-w-5xl mx-auto">
        <h2 class="text-4xl font-serif mb-6 text-center text-rose-500">Философия десертов</h2>
        <p class="text-xl text-gray-700 leading-relaxed text-center">
          Каждый десерт — это маленькая история, созданная с любовью. Я верю, что сладости могут
          дарить радость, объединять людей и создавать атмосферу уюта. Все мои изделия сделаны
          вручную из натуральных ингредиентов, с вниманием к каждой детали.
        </p>
      </div>
    </section>
    <!-- Галерея -->
    <section class="container mx-auto my-20 px-10" data-aos="fade-up">
      <h2 class="text-4xl font-serif text-center text-orange-700 mb-10">Моё обучение и путь в кондитерском искусстве</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <img
          v-for="(image, index) in courses"
          :key="index"
          :src="image"
          alt="cake"
          class="w-full h-60 object-cover object-center rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Дополнительные стили при необходимости */
</style>
