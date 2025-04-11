<script>
export default {
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    handleLogin() {
      // Логика для обработки входа
      console.log('Имя пользователя:', this.username)
      console.log('Пароль:', this.password)
      // Здесь можно добавить логику для аутентификации
    }
  }
}
</script>

<template>
  <div class="max-w-lg m-auto p-10 ">
      <h1 class="font-mono text-center font-bold uppercase m-2 text-xl">Регистрация</h1>
      <form @submit.prevent="handleLogin">
        <div class="mt-6">
          <label class="font-mono" for="surname">Фамилия:</label>
          <input class=" border border-slate-300 rounded-lg p-2" type="text" id="surname" v-model="surname" required />
        </div>
        <div class="mt-6">
          <label class="font-mono" for="username">Имя:</label>
          <input class=" border border-slate-300 rounded-lg p-2" type="text" id="username" v-model="username" required />
        </div>
        <div class="mt-6">
          <label class="font-mono" for="patronymic">Отчество:</label>
          <input class=" border border-slate-300 rounded-lg p-2" type="text" id="patronymic" v-model="patronymic" required />
        </div>
        <div class="mt-6">
          <label class="font-mono" for="email_telefon">Email или телефон:</label>
          <input class=" border border-slate-300 rounded-lg p-2" type="text" id="email_telefon" v-model="email_telefon" required />
        </div>
        <div class="mt-6">
          <label class="font-mono" for="adress">Адресс:</label>
          <input class=" border border-slate-300 rounded-lg p-2" type="text" id="adress" v-model="adress" required />
        </div>
        <div class="mt-6">
          <label class="font-mono text-center" for="password">Пароль:</label>
          <input  class="border border-slate-300 rounded-lg p-2" type="password" id="password" v-model="password" required />
        </div>
        <div class="mt-6">
          <label class="font-mono text-center" for="repepassword">Повторите пароль:</label>
          <input  class="border border-slate-300 rounded-lg p-2" type="password" id="repepassword" v-model="repepassword" required />
        </div>
        <button class="border border-slate-300 rounded-lg p-1 font-mono mb-28 mt-6" type="submit"> <router-link to="/des">Зарегистрироваться</router-link></button>
      </form>
    </div>
</template>

<style scoped>

input[type="text"],
input[type="password"] {
  width: 100%; /* Полная ширина полей ввода */
  transition: border-color 0.3s; /* Плавный переход для рамки */
}

input[type="text"]:focus,
input[type="password"]:focus {
  border-color: #c091d0; /* Цвет рамки при фокусе */
  outline: none; /* Убираем стандартный фокусный контур */
}

button {
  width: 100%; /* Полная ширина кнопки */
  padding: 10px; /* Внутренние отступы */
  background-color: #a69dab; /* Цвет фона кнопки */
  color: white; /* Цвет текста кнопки */
  cursor: pointer; /* Курсор при наведении на кнопку */
  transition: background-color 0.3s; /* Плавный переход для фона кнопки */
}

button:hover {
  background-color: #979598; /* Темнее при наведении */
}
</style>