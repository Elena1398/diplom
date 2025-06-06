<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

// Список изображений
const imageUrls = ['/icons/cake.png', '/icons/macarons.png']

// Генератор стиля с предсказуемым случайным позиционированием
function randomStyle(seed) {
  const seededRand = (min, max) => {
    const x = Math.sin(seed++) * 10000
    return Math.floor((x - Math.floor(x)) * (max - min) + min)
  }

  const top = seededRand(0, 90)
  const left = seededRand(0, 90)
  const rotate = seededRand(0, 360)
  const scale = Math.random() * 0.5 + 0.5

  // Выбор случайного изображения из массива
  const imageUrl = imageUrls[seededRand(0, imageUrls.length)]

  return {
    position: 'absolute',
    top: `${top}%`,
    left: `${left}%`,
    transform: `rotate(${rotate}deg) scale(${scale})`,
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    width: '64px',
    height: '64px',
  }
}
</script>

<template>
  <div class="flex flex-col min-h-screen relative overflow-hidden">
    <Header />

    <!-- Контейнер с градиентом и фоновыми изображениями -->
    <div class="bg-amber-200/50 flex-grow relative">
      
      <!-- Слой фоновых изображений -->
      <div class="absolute inset-0 z-[-1] pointer-events-none">
        <div
          v-for="n in 50"
          :key="n"
          class="bg-no-repeat bg-contain"
          :style="randomStyle(n)"
        ></div>
      </div>

      <!-- Основной контент -->
      <router-view />
    </div>

    <Footer />
  </div>
</template>

<style scoped></style>
