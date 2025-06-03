import { createRouter, createWebHistory } from 'vue-router'
import Header from './components/Header.vue'
import Login from './components/Login.vue'
import Profile from './components/Profile.vue'
import ChangePassword from './components/ChangePassword.vue'
import Registration from './components/Registration.vue'
import AboutThePastryChef from '@/components/AboutThePastryChef.vue'
import HomeDes from './page/HomeDes.vue'
import DecertPage from './page/DecertPage.vue'
import AddDes from './components/AddDes.vue'
import Favourites from '@/page/Favourites.vue'
import Basket from '@/page/Basket.vue'
import Checkout from '@/components/Checkout.vue'
import OrderSuccess from '@/components/OrderSuccess.vue'
import DeliveryAndPayment from '@/components/DeliveryAndPayment.vue'
import MyOrders from '@/components/MyOrders.vue'

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
    path: '/profile',
    component: Profile
  },
  {
    path: '/change-password',
    component: ChangePassword
  },
  {
    path: '/myOrders',
    component: MyOrders
  },
  {
    path: '/desert/:id',
    name: 'DecertPage',
    component: DecertPage,
    props: true
  },
    {
    path: '/addDes',
    name: 'AddDes',
    component: AddDes,
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
    path: '/checkout',
    name: 'Checkout',
    component: Checkout
  },
  {
    path: '/order-success',
    name: 'OrderSuccess',
    component: OrderSuccess
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
  routes,
  scrollBehavior() {
    // всегда прокручивает наверх
    return { top: 0 }
  }
})

export default router
