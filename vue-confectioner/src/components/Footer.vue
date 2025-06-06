<template>
  <footer class="bg-chocolate bg-footer text-light_orange">
    <div class="container mx-auto px-4">
      <div class="flex flex-wrap justify-between items-start">
        <!-- Логотип и копирайт -->
        <div
          class="w-full md:w-1/3 px-4 mb-8 md:mb-0 flex flex-col md:text-left items-center text-center"
        >
          <router-link class="text-3xl uppercase" to="/des">Valentina Oplachko</router-link>
          <p class="text-sm text-light_orange mt-2">
            &copy; 2025 Кондитерские изделия ручной работы
          </p>
        </div>

        <!-- Навигация -->
        <div class="w-full md:w-1/3 px-4 mb-8 md:mb-0 flex flex-col font-mono">
          <h3 class="text-xl underline mb-4">Навигация</h3>
          <ul class="space-y-2 pl-2">
            <li>
              <router-link
                class="text-light_orange hover:text-white transition-all duration-300"
                to="/des"
                >Каталог
              </router-link>
            </li>
            <!-- <li>
              <router-link
                class="text-gray-300 hover:text-white transition-all duration-300"
                to="/aboutThePastryChef"
                >О кондитере
              </router-link>
            </li> -->
            <li>
              <router-link
                class="text-light_orange hover:text-white transition-all duration-300"
                to="/deliveryAndPayment"
                >Доставка и Оплата</router-link
              >
            </li>
            <li>
              <router-link
                to="/favourites"
                class="text-light_orange hover:text-white transition-all duration-300"
                >Избранное
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Контакты -->
        <div>
          <h3 class="text-xl underline mb-4">Контакты</h3>
          <p>г. Кранодар, ул. Казбекская 13</p>
          <p>+7(918)116-34-32</p>
          <p>sweet@valentina.by</p>

          <!-- Соцсети -->
          <div class="flex mt-4 space-x-3">
            <a href="#" class="hover:scale-110 transition-transform">
              <img src="../../public/icons/instagram.png" alt="Instagram" class="h-6 w-6" />
            </a>
            <a href="#" class="hover:scale-110 transition-transform">
              <img src="../../public/icons/youtube.png" alt="YouTube" class="h-6 w-6" />
            </a>
            <a href="#" class="hover:scale-110 transition-transform">
              <img src="../../public/icons/vk.png" alt="VK" class="h-6 w-6" />
            </a>
            <a href="#" class="hover:scale-110 transition-transform">
              <img src="../../public/icons/whatsapp.png" alt="WhatsApp" class="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.bg-chocolate {
  background: linear-gradient(
    135deg,
    #3e2b1f 25%,
    #5c3d2e 25%,
    #5c3d2e 50%,
    #3e2b1f 50%,
    #3e2b1f 75%,
    #5c3d2e 75%,
    #5c3d2e 100%
  );
  background-size: 28px 28px; /* Размер плиток */
  position: relative;
  padding: 20px;
  min-height: 250px;
}

.bg-chocolate::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1); /* Легкая тень для текстуры */
  pointer-events: none;
}
</style>
