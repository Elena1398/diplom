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
      <swiper-slide class="justify-items-center"><img class="w-10/100" src="../../public\main\freepik.jpeg" alt="" /></swiper-slide>
      <swiper-slide class="justify-items-center"><img class="w-10/100" src="../..\public\main\freepik2.jpeg" alt="" /></swiper-slide>
      <swiper-slide class="justify-items-center"><img class="w-4/5" src="../../public\tinified\freepik3.jpeg" alt="" /></swiper-slide>
      <swiper-slide class="justify-items-center"><img class="w-4/5" src="../../public\tinified\freepik4.jpeg" alt="" /></swiper-slide>
    </swiper>
  </div>
</template>

<style scoped>
.mySwiper {
  width: 100%;
  height: 400px;
}

.swiper-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
