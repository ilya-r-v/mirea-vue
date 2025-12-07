<template>
  <div class="container">
    <header class="header">
      <h1><i class="fas fa-palette"></i> Генератор цветовых палитр</h1>
      <p class="subtitle">Создавайте и настраивайте гармоничные цветовые сочетания</p>
    </header>

    <main class="main-content">
      <!-- Панель управления -->
      <section class="control-panel">
        <div class="controls">
          <button class="btn generate-btn" @click="generatePalette">
            <i class="fas fa-random"></i> Случайная палитра
          </button>
          
          <div class="control-group">
            <label for="color-count">
              <i class="fas fa-swatchbook"></i> Количество цветов:
            </label>
            <select id="color-count" v-model="colorCount" @change="handleColorCountChange">
              <option value="3">3</option>
              <option value="5" selected>5</option>
              <option value="7">7</option>
            </select>
          </div>
          
          <div class="control-group">
            <label>
              <i class="fas fa-code"></i> Формат цвета:
            </label>
            <div class="format-toggle">
              <button 
                :class="['format-btn', colorFormat === 'hex' ? 'active' : '']" 
                @click="colorFormat = 'hex'"
              >
                HEX
              </button>
              <button 
                :class="['format-btn', colorFormat === 'rgb' ? 'active' : '']" 
                @click="colorFormat = 'rgb'"
              >
                RGB
              </button>
            </div>
          </div>
          
          <div class="control-group">
            <button class="btn save-btn" @click="savePalette">
              <i class="fas fa-save"></i> Сохранить палитру
            </button>
          </div>
        </div>
        
        <div class="info-text">
          <p v-if="lockedCount > 0">
            <i class="fas fa-lock"></i> Закреплено цветов: {{ lockedCount }}
          </p>
          <p v-else>
            <i class="fas fa-info-circle"></i> Нажмите на замок, чтобы зафиксировать цвет
          </p>
        </div>
      </section>

      <!-- Отображение палитры -->
      <section class="palette-section">
        <div class="palette-container">
          <div 
            v-for="(color, index) in colors" 
            :key="index"
            :class="['color-card', color.locked ? 'locked' : '']"
            :style="{ backgroundColor: color.hex }"
            @click="copyToClipboard(color)"
          >
            <div class="color-info">
              <span class="color-value">
                {{ colorFormat === 'hex' ? color.hex : color.rgb }}
              </span>
            </div>
            
            <button 
              class="lock-btn"
              :title="color.locked ? 'Разблокировать цвет' : 'Заблокировать цвет'"
              @click.stop="toggleLock(index)"
            >
              <i :class="['fas', color.locked ? 'fa-lock' : 'fa-lock-open']"></i>
            </button>
            
            <div class="color-overlay" :class="{ 'show': color.copied }">
              <i class="fas fa-check"></i> Скопировано!
            </div>
          </div>
        </div>
      </section>

      <!-- Превью палитры -->
      <section class="preview-section">
        <div class="preview-header">
          <h2>Превью палитры</h2>
          <div class="preview-controls">
            <button 
              :class="['bg-toggle-btn', bgLight ? 'active' : '']"
              @click="bgLight = true"
            >
              <i class="fas fa-sun"></i> Светлый фон
            </button>
            <button 
              :class="['bg-toggle-btn', !bgLight ? 'active' : '']"
              @click="bgLight = false"
            >
              <i class="fas fa-moon"></i> Тёмный фон
            </button>
          </div>
        </div>
        
        <div class="preview-container" :class="bgLight ? 'light' : 'dark'">
          <div class="mockup-ui">
            <div class="mockup-header" :style="{ backgroundColor: colors[0]?.hex || '#4a6fa5' }">
              <h3 class="mockup-title">Заголовок приложения</h3>
              <button class="mockup-btn">Кнопка</button>
            </div>
            
            <div class="mockup-content">
              <div class="mockup-card" :style="{ backgroundColor: colors[1]?.hex || '#6b9ac4' }">
                <h4>Карточка с контентом</h4>
                <p>Это пример карточки с текстовым содержимым, использующей цвет из палитры.</p>
                <button class="mockup-card-btn">Действие</button>
              </div>
              
              <div class="mockup-sidebar" :style="{ backgroundColor: colors[2]?.hex || '#97d8c4' }">
                <h4>Боковая панель</h4>
                <ul>
                  <li>Элемент меню 1</li>
                  <li>Элемент меню 2</li>
                  <li>Элемент меню 3</li>
                </ul>
              </div>
            </div>
            
            <div class="mockup-footer" :style="{ backgroundColor: colors[3]?.hex || '#4a6fa5' }">
              <p>Футер</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Уведомление о сохранении -->
      <transition name="fade">
        <div v-if="showSavedNotification" class="notification saved-notification">
          <i class="fas fa-check-circle"></i> Палитра сохранена в localStorage!
        </div>
      </transition>
      
      <!-- Уведомление о копировании -->
      <transition name="slide">
        <div v-if="showCopyNotification" class="notification copy-notification">
          <i class="fas fa-copy"></i> {{ copyNotificationText }}
        </div>
      </transition>
    </main>
    
    <footer class="footer">
      <p>Vue App</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Состояние приложения
const colors = ref([])
const colorCount = ref(5)
const colorFormat = ref('hex')
const bgLight = ref(true)
const showSavedNotification = ref(false)
const showCopyNotification = ref(false)
const copyNotificationText = ref('')

// Вычисляемые свойства
const lockedCount = computed(() => {
  return colors.value.filter(color => color.locked).length
})

// Методы
function generateRandomColor() {
  // Генерация гармоничных цветов на основе основного цвета
  const hue = Math.floor(Math.random() * 360)
  const saturation = 70 + Math.floor(Math.random() * 20)
  const lightness = 50 + Math.floor(Math.random() * 20)
  
  return hslToHex(hue, saturation, lightness)
}

function hslToHex(h, s, l) {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  
  let r = 0, g = 0, b = 0
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else {
    r = c; g = 0; b = x
  }
  
  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)
  
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
  
  return {
    hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    locked: false,
    copied: false
  }
}

function generatePalette() {
  const newColors = []
  const lockedColors = colors.value.filter(color => color.locked)
  
  // Сохраняем заблокированные цвета
  for (let i = 0; i < colorCount.value; i++) {
    if (i < lockedColors.length) {
      newColors.push({...lockedColors[i]})
    } else {
      newColors.push(generateRandomColor())
    }
  }
  
  colors.value = newColors
  savePaletteToStorage()
}

function toggleLock(index) {
  colors.value[index].locked = !colors.value[index].locked
  savePaletteToStorage()
}

function copyToClipboard(color) {
  const textToCopy = colorFormat.value === 'hex' ? color.hex : color.rgb
  
  // Используем Clipboard API
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      color.copied = true
      copyNotificationText.value = `Скопировано: ${textToCopy}`
      showCopyNotification.value = true
      
      setTimeout(() => {
        color.copied = false
      }, 1000)
      
      setTimeout(() => {
        showCopyNotification.value = false
      }, 2000)
    })
    .catch(err => {
      console.error('Ошибка копирования: ', err)
      copyNotificationText.value = 'Ошибка копирования'
      showCopyNotification.value = true
      
      setTimeout(() => {
        showCopyNotification.value = false
      }, 2000)
    })
}

function savePalette() {
  savePaletteToStorage()
  showSavedNotification.value = true
  
  setTimeout(() => {
    showSavedNotification.value = false
  }, 2000)
}

function savePaletteToStorage() {
  const paletteToSave = colors.value.map(color => ({
    hex: color.hex,
    rgb: color.rgb,
    locked: color.locked
  }))
  
  localStorage.setItem('colorPalette', JSON.stringify(paletteToSave))
  localStorage.setItem('colorCount', colorCount.value)
  localStorage.setItem('colorFormat', colorFormat.value)
}

function loadPaletteFromStorage() {
  const savedPalette = localStorage.getItem('colorPalette')
  const savedCount = localStorage.getItem('colorCount')
  const savedFormat = localStorage.getItem('colorFormat')
  
  if (savedPalette) {
    colors.value = JSON.parse(savedPalette)
  }
  
  if (savedCount) {
    colorCount.value = parseInt(savedCount)
  }
  
  if (savedFormat) {
    colorFormat.value = savedFormat
  }
}

function handleColorCountChange() {
  // Если новый счетчик больше текущего, добавляем новые цвета
  if (colors.value.length < colorCount.value) {
    for (let i = colors.value.length; i < colorCount.value; i++) {
      colors.value.push(generateRandomColor())
    }
  } 
  // Если новый счетчик меньше текущего, обрезаем массив
  else if (colors.value.length > colorCount.value) {
    // Не обрезаем заблокированные цвета, если они есть
    const lockedColors = colors.value.filter(color => color.locked)
    const newLength = Math.max(colorCount.value, lockedColors.length)
    
    colors.value = colors.value.slice(0, newLength)
  }
  
  savePaletteToStorage()
}

// Хуки жизненного цикла
onMounted(() => {
  loadPaletteFromStorage()
  
  // Если нет сохраненной палитры, генерируем новую
  if (colors.value.length === 0) {
    generatePalette()
  }
})

// Наблюдатель за форматом цвета
watch(colorFormat, () => {
  savePaletteToStorage()
})
</script>

<style scoped>
/* Общие стили */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5rem;
}

.header h1 i {
  color: #4a6fa5;
  margin-right: 10px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* Панель управления */
.control-panel {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  margin-bottom: 15px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

select {
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

select:focus {
  border-color: #4a6fa5;
  outline: none;
}

.format-toggle {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
}

.format-btn {
  padding: 10px 20px;
  border: none;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.format-btn.active {
  background-color: #4a6fa5;
  color: white;
}

.format-btn:not(.active):hover {
  background-color: #e9ecef;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
}

.generate-btn {
  background-color: #4a6fa5;
  color: white;
}

.generate-btn:hover {
  background-color: #3a5a80;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(74, 111, 165, 0.2);
}

.save-btn {
  background-color: #6b9ac4;
  color: white;
}

.save-btn:hover {
  background-color: #5a8ab4;
}

.info-text {
  color: #7f8c8d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-text i {
  color: #4a6fa5;
}

/* Отображение палитры */
.palette-section {
  margin-bottom: 40px;
}

.palette-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.8rem;
}

.palette-container {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  height: 160px;
}

.color-card {
  flex: 1;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 15px;
  overflow: hidden;
}

.color-card:hover {
  flex: 1.2;
  z-index: 2;
}

.color-card.locked {
  box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.8);
}

.color-info {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 6px;
  backdrop-filter: blur(5px);
}

.color-value {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
}

.lock-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.lock-btn:hover {
  background-color: white;
  transform: scale(1.1);
}

.lock-btn i {
  color: #2c3e50;
}

.color-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.color-overlay.show {
  opacity: 1;
}

.color-overlay i {
  margin-right: 10px;
  font-size: 1.5rem;
}

/* Превью палитры */
.preview-section {
  margin-bottom: 40px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.preview-header h2 {
  color: #2c3e50;
  font-size: 1.8rem;
}

.preview-controls {
  display: flex;
  gap: 10px;
}

.bg-toggle-btn {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.bg-toggle-btn.active {
  background-color: #4a6fa5;
  color: white;
  border-color: #4a6fa5;
}

.bg-toggle-btn:not(.active):hover {
  background-color: #f8f9fa;
}

.preview-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.preview-container.light {
  background-color: #f8f9fa;
}

.preview-container.dark {
  background-color: #2c3e50;
}

.mockup-ui {
  min-height: 350px;
  display: flex;
  flex-direction: column;
}

.mockup-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.mockup-title {
  font-size: 1.5rem;
  margin: 0;
}

.mockup-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.mockup-btn:hover {
  background-color: white;
  color: #333;
}

.mockup-content {
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 20px;
}

.mockup-card {
  flex: 3;
  padding: 20px;
  border-radius: 8px;
  color: white;
}

.mockup-card h4 {
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.mockup-card p {
  margin-bottom: 20px;
  line-height: 1.5;
}

.mockup-card-btn {
  background-color: white;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.mockup-card-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.mockup-sidebar {
  flex: 1;
  padding: 20px;
  border-radius: 8px;
  color: white;
}

.mockup-sidebar h4 {
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.mockup-sidebar ul {
  list-style-type: none;
}

.mockup-sidebar li {
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.mockup-footer {
  padding: 15px 20px;
  color: white;
  text-align: center;
}

.preview-hint {
  color: #7f8c8d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Уведомления */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.saved-notification {
  background-color: #2ecc71;
  color: white;
}

.copy-notification {
  background-color: #3498db;
  color: white;
}

/* Анимации */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s, opacity 0.3s;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Футер */
.footer {
  text-align: center;
  margin-top: 50px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .palette-container {
    flex-direction: column;
    height: auto;
  }
  
  .color-card {
    height: 100px;
    justify-content: center;
  }
  
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .mockup-content {
    flex-direction: column;
  }
  
  .header h1 {
    font-size: 2rem;
  }
}
</style>