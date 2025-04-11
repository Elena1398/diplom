import { createRouter, createWebHistory } from 'vue-router'
import Header from './components/Header.vue'
import Login from './components/Login.vue'
import Registration from './components/Registration.vue'
import HomeDes from './page/HomeDes.vue'
import DecertPage from './page/DecertPage.vue'
import Favourites from '@/page/Favourites.vue'
import Basket from '@/page/Basket.vue'
import DeliveryAndPayment from '@/components/DeliveryAndPayment.vue'
import AboutThePastryChef from '@/components/AboutThePastryChef.vue'


const routes = [
  {
    path: '/header',
    component: Header
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/registration',
    component: Registration
  },
  {
    path: '/desert/:id',
    name: 'DecertPage',
    component: DecertPage,
    props: true
  },
  {
    path: '/favourites',
    name: 'Favourites',
    component: Favourites,
    props: true
  },
  {
    path: '/basket',
    name: 'Basket',
    component: Basket,
    props: true
  },
  {
    path: '/deliveryAndPayment',
    name: 'DeliveryAndPayment',
    component: DeliveryAndPayment
  },
  {
    path: '/aboutThePastryChef',
    name: 'AboutThePastryChef',
    component: AboutThePastryChef
  },
  {
    path: '/des',
    name: 'HomeDes',
    component: HomeDes,
    alias: '/',
    props: true
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
