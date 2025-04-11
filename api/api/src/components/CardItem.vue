<script setup>
const props = defineProps({
  code: Number,
  imageUrl: String,
  title: String,
  price: Number,
  basketId: Number // Убедитесь, что здесь есть basketId
})

const emit = defineEmits(['remove-item']) // Сигнал для родительского компонента

const removeFromCart = () => {
  // Передаем basketId в родительский компонент через событие
  emit('remove-item', props.basketId)
}
</script>

<template>
  <div class="flex items-center border border-slate-300 p-4 rounded-xl gap-4 shadow-sm mt-4">
    <router-link :to="{ name: 'DecertPage', params: { id: props.code } }">
      <img :src="imageUrl" alt="dessert" class="w-40 h-32 object-cover rounded-lg" />
    </router-link>
    <div class="flex flex-grow flex-col space-y-2 flex-1">
      <p class="text-lg font-medium">{{ title }}</p>
      <div class="flex justify-between items-center">
        <b class="text-xl text-gray-700 flex-1">{{ price }} ₽</b>
        <img
          class="w-6 h-6 opacity-40 hover:opacity-100 cursor-pointer transition"
          src="/svg/close.svg"
          alt="Удалить"
          @click="removeFromCart"
        />
      </div>
    </div>
  </div>
</template>
