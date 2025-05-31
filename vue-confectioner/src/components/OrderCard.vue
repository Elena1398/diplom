<script setup>
defineProps({
  item: Object
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(price)
}

// Пример логики: считаем, что торт — это item.category === 'cake'
// Если у тебя нет категории, можно заменить логику на название или id
const isCake = (item) => {
  // Если у тебя есть поле категории — используй его
  if (item.category) {
    return item.category === 'cake'
  }
  // Если категории нет, проверяем по названию (пример)
  const cakeKeywords = ['торт', 'cake', 'пирог']
  return cakeKeywords.some(keyword => item.des_name.toLowerCase().includes(keyword))
}

// Форматируем вес: если больше 999, то в кг, иначе в граммах
const formatWeight = (weightInGrams) => {
  // Приводим к числу — убираем всё, кроме цифр
  const numericWeight = parseFloat(weightInGrams.toString().replace(/[^\d.]/g, ''));

  if (numericWeight >= 1000) {
    return (numericWeight / 1000).toFixed(1) + ' кг';
  }
  return numericWeight + ' г';
}


</script>

<template>
  <div
    class="relative bg-white border border-slate-300 rounded-3xl p-6 cursor-pointer transition hover:-translate-y-2 hover:shadow-xl flex flex-col h-full"
  >
    <router-link :to="{ name: 'DecertPage', params: { id: item.des_id } }" class="flex flex-col h-full">
      <img :src="item.photo" alt="dessert" class="rounded-xl mb-4 object-cover h-40 w-full" />
      <p class="mt-2 font-bold text-center flex-grow min-h-[60px]">{{ item.des_name }}</p>
    </router-link>

    <div class="flex justify-between mt-5">
      <div v-if="isCake(item)" class="flex flex-col">
        <span class="text-slate-400">Вес:</span>
        <b>{{ formatWeight(item.final_weight) }}</b>
      </div>
      <div v-else class="flex flex-col">
        <span class="text-slate-400">Количество:</span>
        <b>{{ item.quantity }}</b>
      </div>

      <div class="flex flex-col">
        <span class="text-slate-400">Цена:</span>
        <b>{{ formatPrice(item.sum_price_list) }}</b>
      </div>
    </div>
  </div>
</template>
