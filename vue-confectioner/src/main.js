import './assets/main.css'

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
// import YandexMaps from 'vue-yandex-maps'

// const settings = {
//   apiKey: 'c51281bb-627f-42e8-a3c8-0dc06d1941de&l', // Замените на ваш API-ключ
//   lang: 'ru_RU',
//   version: '2.1',
// }

createApp(App)
  .use(router)
  .use(autoAnimatePlugin)
  // .use(YandexMaps, settings)
  .mount('#app');