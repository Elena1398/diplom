<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useRoute } from 'vue-router'
const route = useRoute()

const dessertId = route.query.id

const router = useRouter()
const image = ref(null)
const imagePreview = ref(null)
const showAlert = ref(false)
const alertMessage = ref('')
const fileCover = ref(null)
const isSubmitting = ref(false)
const isCakeCategory = computed(() => dessert.value.categoryId === 1)
const showModal = ref(false)
const modalMessage = ref('')
const isSuccess = ref(true) // для стилизации (успех или ошибка)

const showModalMessage = (message, success = true) => {
  modalMessage.value = message
  isSuccess.value = success
  showModal.value = true
}

const handleModalClose = () => {
  showModal.value = false
  router.push('/') // Переход после закрытия модалки
}

const dessert = ref({
  title: '',
  price: null,
  photo: '',
  weight: null,
  protein: null,
  fast: null,
  carbohydrates: null,
  calories: null,
  description: '',
  structure: '',
  categoryId: null,
  tasteId: null
})

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    fileCover.value = file
    image.value = file
    dessert.value.photo = file.name
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

onMounted(async () => {
  imagePreview.value = dessert.value.cover_art ? `/photo/${dessert.value.photo}` : null
  console.log('Загруженная десертов:', dessert.value)
})

const onChangeSelect = (event) => {
  dessert.value.categoryId = parseInt(event.target.value)
}
const onChangeTastes = (event) => {
  dessert.value.tasteId = parseInt(event.target.value)
}

const saveDessert = async () => {
  const requiredFields = [
    'title',
    'price',
    'weight',
    'protein',
    'fast',
    'carbohydrates',
    'calories',
    'description',
    'structure',
    'categoryId',
    'tasteId'
  ]

  const emptyFields = requiredFields.filter((field) => !dessert.value[field]?.toString().trim())
  if (emptyFields.length > 0) {
    alertMessage.value = 'Пожалуйста, заполните все поля и загрузите изображение перед сохранением.'
    showAlert.value = true
    return
  }

  const numericFields = ['price', 'weight', 'protein', 'fast', 'carbohydrates', 'calories']
  const invalidNumbers = numericFields.filter((field) => isNaN(Number(dessert.value[field])))
  if (invalidNumbers.length > 0) {
    alertMessage.value = 'Поля "Цена", "Вес", "БЖУ" и "Калории" должны содержать только цифры.'
    showAlert.value = true
    return
  }

  // Преобразование в нужный тип
  numericFields.forEach((field) => {
    dessert.value[field] = Number(dessert.value[field])
  })
  dessert.value.categoryId = Number(dessert.value.categoryId)
  dessert.value.tasteId = Number(dessert.value.tasteId)

  // // Читаем файл как base64
  // const readFileAsBase64 = (file) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = () => resolve(reader.result);
  //     reader.onerror = reject;
  //     reader.readAsDataURL(file);
  //   });
  // };
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    if (image.value && fileCover.value) {
      dessert.value.photo = fileCover.value.name
    } else if (typeof dessert.value.photo === 'string') {
      dessert.value.photo = dessert.value.photo.split('\\').pop()
    }
    if (isEdit.value) {
      await axios.put(`http://localhost:8080/apis/adddesserts/${dessertId}`, dessert.value, {
        headers: { 'Content-Type': 'application/json' }
      })
      showModalMessage('Десерт успешно обновлён!', true) // ✅ правильно
    } else {
      await axios.post('http://localhost:8080/apis/adddesserts', dessert.value, {
        headers: { 'Content-Type': 'application/json' }
      })
      showModalMessage('Десерт успешно добавлен!', true) // ✅ правильно
    }
  } catch (error) {
    if (error.response) {
      showModalMessage(`Ошибка: ${error.response?.data?.message || error.message}`, false)
    } else if (error.request) {
      showModalMessage('Нет ответа от сервера.')
    } else {
      showModalMessage(`Ошибка при отправке запроса: ${error.message}`)
    }
    showAlert.value = true
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}

const updatePrice = () => {
  const weight = Number(dessert.value.weight)
  if (weight === 1.0) {
    dessert.value.price = 2500 // первая цена из price_list для 1.0
  } else if (weight === 2.0) {
    dessert.value.price = 4000 // первая цена из price_list для 2.0
  } else {
    dessert.value.price = null
  }
}

const isEdit = ref(false)

onMounted(async () => {
  if (dessertId) {
    isEdit.value = true
    try {
      const { data } = await axios.get(`http://localhost:8080/apis/deserts/${dessertId}`)
      console.log('Загруженные данные десерта:', data) // проверь, что есть categoryId
      dessert.value = {
        title: data.title || '',
        price: data.price || null,
        photo: data.photo || '',
        weight: data.weight || null,
        protein: data.protein || null,
        fast: data.fast || null,
        carbohydrates: data.carbohydrates || null,
        calories: data.calories || null,
        description: data.description || '',
        structure: data.ingredients || '', // 👈 тут главное!
        categoryId: data.categoryid || null,
        tasteId: data.tasteId || null // если есть
      }

      imagePreview.value = `/photo/${data.photo}`
    } catch (error) {
      console.error('Ошибка загрузки десерта:', error)
    }
  }
})
</script>

<template>
  <div class="py-16 mb-40 m-10">
    <h2 class="text-3xl font-mono mb-6">
      {{ isEdit ? 'Редактировать десерт' : 'Добавить новый десерт' }}
    </h2>

    <div class="flex flex-col md:flex-row gap-10">
      <!-- Фото -->
      <div class="md:w-1/3 w-full">
        <label class="block text-xl font-medium mb-4">Фото</label>
        <div class="flex items-center gap-4 mb-4">
          <label
            class="cursor-pointer text-sm bg-lilac hover:bg-purple-600 active:scale-90 transition text-white py-2 px-4 rounded shadow inline-block"
          >
            Выбрать файл
            <input type="file" accept="image/*" @change="handleImageUpload" class="hidden" />
          </label>
          <p class="text-sm text-gray-600 mt-2 mb-4">
            {{ imagePreview ? 'Файл выбран' : 'Файл не выбран' }}
          </p>
        </div>
        <img
          v-if="imagePreview"
          :src="imagePreview"
          alt="Фото десерта"
          class="w-full h-auto max-w-xs object-contain rounded shadow border"
        />
      </div>

      <!-- Форма -->
      <div class="bg-amber-200/50 rounded-2xl p-5 flex-1">
        <form @submit.prevent="saveDessert" class="space-y-6">
          <input
            placeholder="Название"
            v-model="dessert.title"
            type="text"
            required
            class="w-full border p-2 rounded"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              v-model="dessert.tasteId"
              class="border border-slate-300 rounded-md w-full p-2 outline-none font-mono"
              @change="onChangeTastes"
              placeholder="Название"
            >
              <option disabled value="">Выберите вкус</option>
              <option value="1">Клубника</option>
              <option value="2">Манго</option>
              <option value="3">Шоколад</option>
              <option value="4">Орехи</option>
              <option value="5">Малина</option>
              <option value="6">Кофе</option>
            </select>

            <select
              v-model="dessert.categoryId"
              class="border border-slate-300 rounded-md w-full p-2 outline-none font-mono"
              @change="onChangeSelect"
            >
              <option disabled value="">Выберите категорию</option>
              <option value="1">Торт</option>
              <option value="2">Пирожные</option>
              <option value="3">Выпечка</option>
              <option value="4">Печенье</option>
              <option value="5">Конфеты</option>
            </select>
          </div>

          <!-- Если Торт -->
          <div v-if="isCakeCategory" class="grid grid-cols-2 gap-4">
            <select
              v-model="dessert.weight"
              class="w-full border p-2 rounded"
              @change="updatePrice"
            >
              <option disabled value="">Выберите вес</option>
              <option value="1.0">1.0 кг</option>
              <option value="2.0">2.0 кг</option>
            </select>

            <input
              placeholder="Цена (₽)"
              v-model="dessert.price"
              type="number"
              class="w-full border p-2 rounded"
              readonly
            />
          </div>

          <!-- Если НЕ торт -->
          <div v-else class="grid grid-cols-2 gap-4">
            <input
              placeholder="Вес (г)"
              v-model="dessert.weight"
              type="number"
              class="w-full border p-2 rounded"
            />

            <input
              placeholder="Цена (₽)"
              v-model="dessert.price"
              type="number"
              class="w-full border p-2 rounded"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <input
              placeholder="Белки (г)"
              v-model="dessert.protein"
              type="number"
              step="any"
              class="w-full border p-2 rounded"
            />
            <input
              placeholder="Жиры (г)"
              v-model="dessert.fast"
              type="number"
              step="any"
              class="w-full border p-2 rounded"
            />
            <input
              placeholder="Углеводы (г)"
              v-model="dessert.carbohydrates"
              type="number"
              step="any"
              class="w-full border p-2 rounded"
            />
            <input
              placeholder="Калории (ккал)"
              v-model="dessert.calories"
              type="number"
              step="any"
              class="w-full border p-2 rounded"
            />
          </div>

          <textarea
            placeholder="Описание"
            v-model="dessert.description"
            required
            class="w-full border p-2 rounded"
          ></textarea>
          <textarea
            placeholder="Состав"
            v-model="dessert.structure"
            required
            class="w-full border p-2 rounded"
          ></textarea>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="bg-lilac text-white px-4 py-2 rounded hover:bg-purple-600 transition"
          >
            {{ isEdit ? 'Сохранить изменения' : 'Добавить десерт' }}
          </button>
          <div v-if="showAlert" class="text-red-600 mt-2">{{ alertMessage }}</div>
        </form>
        <!-- Модальное окно -->
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <div class="bg-white rounded-xl p-6 shadow-xl max-w-md w-full text-center">
            <p class="text-lg font-semibold mb-4">{{ modalMessage }}</p>
            <button
              @click="handleModalClose"
              class="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
