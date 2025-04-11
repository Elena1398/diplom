<script>
import { Swiper, SwiperSlide } from 'swiper/vue'

import 'swiper/css'

import 'swiper/css/navigation'
import 'swiper/css/pagination'

import '../../src/assets/main.css'

import { Navigation, Pagination, Mousewheel, Keyboard } from 'swiper/modules'

export default {
  components: {
    Swiper,
    SwiperSlide
  },
  setup() {
    return {
      modules: [Navigation, Pagination, Mousewheel, Keyboard]
    }
  }
}
</script>

<template>
  <div class="rounded-xl">
    <swiper
      :cssMode="true"
      :navigation="true"
      :pagination="true"
      :mousewheel="true"
      :keyboard="true"
      :modules="modules"
      class="mySwiper"
    >
      <swiper-slide><img src="../../public\tinified\freepik.jpeg" alt="" /></swiper-slide>
      <swiper-slide><img src="../../public\tinified\freepik2.jpeg" alt="" /></swiper-slide>
      <swiper-slide><img src="../../public\tinified\freepik3.jpeg" alt="" /></swiper-slide>
      <swiper-slide><img src="../../public\tinified\freepik4.jpeg" alt="" /></swiper-slide>
    </swiper>
  </div>
</template>

<style scoped>
.swiper {
  width: 100%;
  height: 50%;
}

.swiper-slide {
  text-align: center;
  font-size: 18px;
  background: #ffffff;

  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper-slide img {
  width: 100%;
  height: 50%;
  object-fit: cover;
}
</style>
