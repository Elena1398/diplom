<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <div class="flex-grow">
      <router-view></router-view>
    </div>
  </div>
  <Footer />
</template>

<style scoped></style>