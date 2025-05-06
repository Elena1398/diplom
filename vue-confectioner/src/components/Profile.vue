<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

onMounted(() => {
  auth.loadUserFromLocalStorage() // Загружаем данные пользователя при монтировании компонента
})


const surname = ref('')
const name = ref('')
const patronymic = ref('')
const birthday = ref('')
const email = ref('')
const login = ref('')
const adress = ref('')
const emailOrPhoneError = ref(false)


onMounted(async () => {
  const userId = localStorage.getItem('customersId')
  if (!userId) return

  try {
    const res = await axios.get(`http://localhost:8080/apis/customer/${userId}`) // подставь свой путь
    const user = res.data

    surname.value = user.cus_surname
    name.value = user.cus_name
    patronymic.value = user.cus_patronymic
    birthday.value = user.date_of_birthday // уже форматирован
    email.value = user.cus_email
    login.value = user.login
    adress.value = user.cus_adress
  } catch (err) {
    console.error('Ошибка загрузки данных пользователя:', err)
  }
})

const saveChanges = async () => {
  const userId = localStorage.getItem('customersId')
  if (!userId) return

  // Валидация email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailOrPhoneError.value = !emailRegex.test(email.value)
  if (emailOrPhoneError.value) return

  try {
    await axios.put(`http://localhost:8080/apis/customer/${userId}`, {
      surname: surname.value,
      name: name.value,
      patronymic: patronymic.value,
      birthday: birthday.value,
      email: email.value,
      login: login.value,
      adress: adress.value
    })
    alert('Данные успешно сохранены!')
  } catch (err) {
    console.error('Ошибка при сохранении:', err)
    alert('Произошла ошибка при сохранении данных.')
  }
}

</script>

<template>
  <div class="max-w-lg mx-auto p-10">
    <h1 class="font-mono text-center font-bold uppercase mb-4 text-xl">Профиля</h1>
    <form action="">
      <div class="mb-6">
        <label class="block font-mono mb-2">Фамилия:</label>
        <input
          id="surname"
          v-model="surname"
          type="text"
          required
          class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400 transition duration-300"
        />
      </div>
      <div class="mb-6">
        <label class="block font-mono mb-2">Имя:</label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400 transition duration-300"
        />
      </div>
      <div class="mb-6">
        <label class="block font-mono mb-2">Отчество:</label>
        <input
          id="patronymic"
          v-model="patronymic"
          type="text"
          required
          class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400 transition duration-300"
        />
      </div>
      <div class="mb-6">
        <label class="block font-mono mb-2">Дата рождения:</label>
        <input
          id="birthday"
          v-model="birthday"
          type="date"
          required
          class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400 transition duration-300"
        />
      </div>
      <div class="mb-6">
        <label class="block font-mono mb-2">Email:</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="example@mail.com "
          required
          :class="[
            'w-full p-2 border rounded-lg focus:outline-none transition duration-300',
            emailOrPhoneError
              ? 'border-red-500 focus:border-red-500'
              : 'border-slate-300 focus:border-purple-400'
          ]"
        />
        <p v-if="emailOrPhoneError" class="text-red-500 text-sm mt-1 font-mono">
          Введите корректный email.
        </p>
      </div>
      <div class="mb-6">
        <label class="block font-mono mb-2">Логин:</label>
        <input
          id="login"
          v-model="login"
          type="text"
          required
          class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400 transition duration-300"
        />
      </div>
      <div class="mb-6">
        <label class="block font-mono mb-2">Адрес:</label>
        <input
          id="adress"
          v-model="adress"
          type="text"
          required
          class="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-400 transition duration-300"
        />
      </div>
    </form>
    <button
  @click.prevent="saveChanges"
  class="border border-slate-300 rounded-lg py-2 px-4 mt-8 bg-lilac text-white font-mono block mx-auto"
>
  Редактировать 
</button>

  </div>
</template>
