<script>
export default {
  mounted() {
    this.initMap() // Инициализация карты после монтирования компонента
  },
  methods: {
    initMap() {
      if (window.ymaps) {
        window.ymaps.ready(() => {
          // Создайте объект карты
          const map = new window.ymaps.Map('map', {
            center: [45.066029, 38.954921], // Координаты центра карты
            zoom: 16 // Уровень масштаба
          })

          // Добавление маркера
          const placemark = new window.ymaps.Placemark(
            [45.066029, 38.954921],
            {
              balloonContent:
                `<div class="balloon">
                    <div class="balloon__address">Казбекская улица, 13</div>
                        <div class="balloon__contacts">
                            <a href="tel:+7 (812) 123-45-67" class="info info--tel">8 (812) 123-45-67</a>
                    </div>
                </div> `
            },
            {
              iconLayout: 'default#image',
              iconImageHref: '../../public/map/marker2-map.png', // Путь к иконке маркера
              iconImageSize: [45, 45],
              iconImageOffset: [-20, -45] // Смещение иконки относительно точки
            }
          )

          // Удаление ненужных элементов на карте
          map.controls.remove('geolocationControl') // удаляем геолокацию
          map.controls.remove('searchControl') // удаляем поиск
          map.controls.remove('trafficControl') // удаляем контроль трафика
          map.controls.remove('typeSelector') // удаляем тип
          map.controls.remove('rulerControl') // удаляем контрол правил
          map.behaviors.disable(['scrollZoom']) // отключаем скролл карты (опционально)

          // Размещение геообъекта на карте.
          map.geoObjects.add(placemark)
        })
      }
    }
  }
}
</script>

<template>
  <section class="map">
    <!-- Карта -->
    <section class="container mx-auto p-10 m-40 mt-10" data-aos="fade-right">
      <!-- Заголовок -->
      <div>
        <h2 class="text-6xl text-gray-800 font-serif text-left mb-10">Карта</h2>
      </div>
      <!-- Блок для карты -->
      <div id="map" class="w-full h-[500px] bg-gray-200 rounded-lg shadow-xl"></div>
    </section>
  </section>
</template>

<style>

[class*="copyrights-pane"] {
	/* display: none !important; */
    opacity: 0;
    transition: opacity 0.2s ease-in;
}

.map:hover [class*="copyrights-pane"] {
    opacity: 1;
}

/* Создать свою карту */
[class*="gototech"] {
    display: none !important;
}

[class*="ground-pane"] {
    filter: grayscale(75%) hue-rotate(30deg);
}

/* Baloon */

[class*="balloon__layout"], [class*="balloon__content"] {
	background-color: #d6d3f1 !important;
    color: #000000 !important;
}

[class*="balloon__tail"]::after {
	background-color: #9D98CA !important;
}

[class*="balloon_layout_panel"] {
	background-color: #242b33 !important;
}

[class*="balloon__layout"], [class*="balloon__content"] a {
    color: #1c1b1e !important;
}

[class*="balloon__close-button"] {
    background: url('../../public/map/cross.svg') 50% no-repeat !important;
    width: 15px !important;
    height: 15px !important;
    margin: 10px 7px;
}
</style>
