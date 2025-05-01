import './assets/main.css'

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'



createApp(App)
  .use(router)
  .use(createPinia())
  .use(autoAnimatePlugin)
  .mount('#app');