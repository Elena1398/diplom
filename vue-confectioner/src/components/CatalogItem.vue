<script setup>
import CardItem from '../components/CardItem.vue'

defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  }
})


</script>

<template>
  <div class="flex flex-col gap-5">
    <CardItem
      v-for="item in items"
      :key="item.des_id"
      :code="item.des_id"
      :title="item.des_name"
      :price="isNaN(parseFloat(item.price)) ? 0 : parseFloat(item.price)"
      :imageUrl="item.photo"
      
    />
  </div>
</template>
