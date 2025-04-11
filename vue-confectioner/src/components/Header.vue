<script>
export default {}
</script>
<template>
  <header class="flex justify-between border-b border-slate-300 px-10 py-8">
    <router-link to="/des"
      ><div class="flex items-center gap-4">
        <a class="text-xl uppercase"
          >Valentina Oplachko
          <p class="text-sm text-slate-400">Кондитерские изделия</p>
        </a>
      </div></router-link
    >

    <nav class="flex items-center">
      <ul class="flex items-center gap-10 gap-15">
        <li class="hover:text-slate-500 cursor-pointer">
          <router-link to="/des">Каталог</router-link>
        </li>
        <li class="hover:text-slate-500 cursor-pointer">
          <router-link to="/aboutThePastryChef">О кондитере</router-link>
        </li>
        <li class="hover:text-slate-500 cursor-pointer">
          <router-link to="/deliveryAndPayment">Доставка и Оплата</router-link>
        </li>
        <!-- <li class="hover:text-slate-500 cursor-pointer">
          <router-link to="/">Торты на заказ</router-link>
        </li> -->

        <router-link to="/favourites"
          ><li class="flex items-center hover:text-slate-500 gap-3 cursor-pointer">
            <img src="../../svg/lik.svg" alt="" />
            Избранное
          </li></router-link
        >
        <router-link to="/login"
          ><li class="flex items-center hover:text-slate-500 gap-3 cursor-pointer">
            <img src="../../svg/person.svg" alt="" />
            Вход
          </li></router-link
        >
        <router-link to="/basket"
          ><li class="flex items-center hover:text-slate-500 gap-3 cursor-pointer">
            <img src="../../svg/shopping_basket.svg" alt="" />
            Корзина
          </li></router-link
        >
      </ul>
    </nav>
  </header>
</template>
