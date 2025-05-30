<template>
  <footer class="bg-zinc-800 py-16 mt-40 text-white">
    <div class="container mx-auto px-4">
      <div class="flex flex-wrap justify-between items-start">
        <!-- Логотип и копирайт -->
        <div
          class="w-full md:w-1/3 px-4 mb-8 md:mb-0 flex flex-col md:text-left items-center text-center"
        >
          <router-link class="text-3xl uppercase" to="/des">Valentina Oplachko</router-link>
          <p class="text-sm text-gray-400 mt-2">&copy; 2025 Кондитерские изделия ручной работы</p>
        </div>

        <!-- Навигация -->
        <div class="w-full md:w-1/3 px-4 mb-8 md:mb-0 flex flex-col font-mono">
          <h3 class="text-xl underline mb-4">Навигация</h3>
          <ul class="space-y-2 pl-2">
            <li>
              <router-link
                class="text-gray-300 hover:text-white transition-all duration-300"
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
                class="text-gray-300 hover:text-white transition-all duration-300"
                to="/deliveryAndPayment"
                >Доставка и Оплата</router-link
              >
            </li>
            <li>
              <router-link
                to="/favourites"
                class="text-gray-300 hover:text-white transition-all duration-300"
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
