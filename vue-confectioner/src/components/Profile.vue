<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const surname = ref('')
const name = ref('')
const patronymic = ref('')
const birthday = ref('')
const email = ref('')
const login = ref('')
const adress = ref('')
const emailOrPhoneError = ref(false)
const role = ref('')

// Управление модалкой
const showModal = ref(false)
const modalMessage = ref('')

onMounted(async () => {
  await auth.loadUserFromLocalStorage()

  const userId = auth.user?.admin_id || auth.user?.cus_id
  const role = auth.user?.role

  if (!userId || !role) return

  try {
    let res
    if (role === 'admin') {
      res = await axios.get(`http://localhost:8080/apis/admin/${userId}`)
    } else {
      res = await axios.get(`http://localhost:8080/apis/customer/${userId}`)
    }

    const user = res.data

    surname.value = user.surname || user.cus_surname || user.surname_admin || ''
    name.value = user.name || user.cus_name || user.firstname_admin || ''
    patronymic.value = user.patronymic || user.cus_patronymic || user.patronymic_admin || ''
    birthday.value = user.birthday || user.date_of_birthday || ''
    email.value = user.email || user.cus_email || ''
    login.value = user.login || ''
    adress.value = user.address || user.cus_adress || ''
    role.value = role
  } catch (err) {
    console.error('Ошибка загрузки данных пользователя:', err)
  }
})


const saveChanges = async () => {
  const userId = localStorage.getItem('userId')
  const role = localStorage.getItem('role')

  if (!userId || !role) return

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailOrPhoneError.value = !emailRegex.test(email.value)
  if (emailOrPhoneError.value) return

  try {
    if (role === 'admin') {
      await axios.put(`http://localhost:8080/apis/admin/${userId}`, {
        surname: surname.value,
        name: name.value,
        patronymic: patronymic.value,
        birthday: birthday.value,
        email: email.value,
        login: login.value
      })
    } else {
      await axios.put(`http://localhost:8080/apis/customer/${userId}`, {
        surname: surname.value,
        name: name.value,
        patronymic: patronymic.value,
        birthday: birthday.value,
        email: email.value,
        login: login.value,
        adress: adress.value
      })
    }

    auth.user = {
      ...auth.user,
      surname: surname.value,
      name: name.value,
      patronymic: patronymic.value,
      birthday: birthday.value,
      email: email.value,
      login: login.value,
      adress: adress.value
    }

    modalMessage.value = 'Данные успешно сохранены!'
    showModal.value = true

  } catch (err) {
    console.error('Ошибка при сохранении:', err)
    modalMessage.value = 'Произошла ошибка при сохранении данных.'
    showModal.value = true
  }
}



const closeModal = () => {
  showModal.value = false
}
</script>

<template>
  <div class="bg-amber-200/50 rounded-lg mt-20 py-16 mb-40 max-w-lg mx-auto p-10">
    <h1 class="font-mono text-center font-bold uppercase mb-4 text-xl">Профиль</h1>
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
      <div class="mb-6" v-if="role !== 'admin'">
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
  <div
    v-if="showModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white p-6 rounded-lg max-w-sm w-full text-center font-mono shadow-lg">
      <p class="mb-6 text-lg">{{ modalMessage }}</p>
      <button
        @click="closeModal"
        class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
      >
        ОК
      </button>
    </div>
  </div>
</template>
