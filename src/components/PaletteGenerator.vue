<template>
  <div class="generator-container">
    <div class="advanced-controls">
      <!-- Выбор базового цвета -->
      <div class="control-group">
        <label for="base-color">
          Базовый цвет:
        </label>
        <input 
          type="color" 
          id="base-color" 
          v-model="baseColor"
          @change="generateFromBaseColor"
        >
        <span class="color-value">{{ baseColor }}</span>
      </div>

      <!-- Тип гармонии -->
      <div class="control-group">
        <label for="harmony-type">
          Тип гармонии:
        </label>
        <select id="harmony-type" v-model="harmonyType" @change="generateFromBaseColor">
          <option value="analogous">Аналогичная</option>
          <option value="monochromatic">Монохромная</option>
          <option value="triadic">Триада</option>
          <option value="complementary">Комплементарная</option>
          <option value="tetradic">Тетрадная</option>
        </select>
      </div>

      <!-- Настроение -->
      <div class="control-group">
        <label for="mood-type">
          Настроение:
        </label>
        <select id="mood-type" v-model="moodType" @change="handleMoodPalette">
          <option value="calm">Спокойные</option>
          <option value="energetic">Энергичные</option>
          <option value="professional">Профессиональные</option>
          <option value="vibrant">Яркие</option>
          <option value="pastel">Пастельные</option>
        </select>
      </div>

      <!-- Сохранение палитры -->
      <div class="control-group">
        <label for="palette-name">
          Название палитры:
        </label>
        <input 
          type="text" 
          id="palette-name" 
          v-model="paletteName"
          placeholder="Введите название"
        >
        <button class="btn save-btn" @click="saveToLibrary">
          Сохранить в библиотеку
        </button>
      </div>
    </div>

    <!-- Базовые элементы управления -->
    <div class="basic-controls">
      <button class="btn generate-btn" @click="generateRandomPalette">
        Случайная палитра
      </button>
      
      <div class="control-group">
        <label for="color-count">
          Количество цветов:
        </label>
        <select id="color-count" v-model="colorCount" @change="handleColorCountChange">
          <option value="3">3</option>
          <option value="5">5</option>
          <option value="7">7</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>
          Формат цвета:
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
        <button class="btn save-btn" @click="saveCurrentPalette">
          Сохранить палитру
        </button>
      </div>
    </div>
    
    <div class="info-text">
      <p v-if="lockedCount > 0">
        Закреплено цветов: {{ lockedCount }}
      </p>
      <p v-else>
        Нажмите на замок, чтобы зафиксировать цвет
      </p>
    </div>

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
            {{ color.locked ? '🔒' : '🔓' }}
          </button>
          
          <div class="color-overlay" :class="{ 'show': color.copied }">
            Скопировано!
          </div>
        </div>
      </div>
    </section>

    <!-- Анализ контрастности -->
    <div class="contrast-analysis">
      <h3>Анализ контрастности (WCAG)</h3>
      <div class="contrast-grid">
        <div v-for="(row, rowIndex) in contrastMatrix" :key="rowIndex" class="contrast-row">
          <div 
            v-for="(cell, colIndex) in row" 
            :key="colIndex"
            class="contrast-cell"
            :style="{ backgroundColor: colors[colIndex]?.hex }"
            :title="`${colors[rowIndex]?.hex} vs ${colors[colIndex]?.hex}: ${cell?.ratio || ''}`"
          >
            <span v-if="cell" class="contrast-value" :class="{
              'excellent': cell.level === 'AAA',
              'good': cell.level === 'AA',
              'acceptable': cell.level === 'AA Large',
              'poor': cell.level === 'Недостаточно'
            }">
              {{ cell.ratio }}
            </span>
            <span v-if="cell" class="contrast-level">
              {{ getContrastLevelText(cell.level) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Превью палитры -->
    <section class="preview-section">
      <div class="preview-header">
        <h2>Превью палитры</h2>
        <div class="preview-controls">
          <button 
            :class="['bg-toggle-btn', bgLight ? 'active' : '']"
            @click="bgLight = true"
          >
            Светлый фон
          </button>
          <button 
            :class="['bg-toggle-btn', !bgLight ? 'active' : '']"
            @click="bgLight = false"
          >
            Тёмный фон
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

    <!-- Шаринг -->
    <div class="sharing-section">
      <button class="btn share-btn" @click="generateShareLink">
        Создать ссылку для шаринга
      </button>
      <div v-if="shareLink" class="share-link">
        <input type="text" :value="shareLink" readonly>
        <button class="btn copy-link-btn" @click="copyShareLink">
          Копировать
        </button>
      </div>
    </div>

    <!-- Уведомления -->
    <transition name="fade">
      <div v-if="showSavedNotification" class="notification saved-notification">
        Палитра сохранена!
      </div>
    </transition>
    
    <transition name="slide">
      <div v-if="showCopyNotification" class="notification copy-notification">
        {{ copyNotificationText }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ColorWheel from './ColorWheel.vue'
import { 
  generateHarmonyPalette, 
  generateMoodPalette,
  calculateContrast,
  generateShareableLink 
} from '../utils/colorUtils'

const baseColor = ref('#4a6fa5')
const harmonyType = ref('analogous')
const moodType = ref('calm')
const paletteName = ref('')
const shareLink = ref('')
const colorCount = ref(5)
const colorFormat = ref('hex')
const bgLight = ref(true)
const showSavedNotification = ref(false)
const showCopyNotification = ref(false)
const copyNotificationText = ref('')

const colors = ref([])

// Вычисляемые свойства
const lockedCount = computed(() => {
  return colors.value.filter(color => color.locked).length
})

// Матрица контрастности
const contrastMatrix = computed(() => {
  const matrix = []
  for (let i = 0; i < colors.value.length; i++) {
    matrix[i] = []
    for (let j = 0; j < colors.value.length; j++) {
      if (i === j) {
        matrix[i][j] = null
      } else {
        const contrast = calculateContrast(
          colors.value[i]?.hex,
          colors.value[j]?.hex
        )
        // Переводим уровень контраста на русский
        matrix[i][j] = {
          ...contrast,
          level: getContrastLevelText(contrast.level)
        }
      }
    }
  }
  return matrix
})

// Функция для получения текста уровня контраста
function getContrastLevelText(level) {
  const levels = {
    'AAA': 'Отличный',
    'AA': 'Хороший',
    'AA Large': 'Приемлемый',
    'Insufficient': 'Недостаточно'
  }
  return levels[level] || level
}

// Функции для генерации
function generateRandomColor() {
  const hue = Math.floor(Math.random() * 360)
  const saturation = 60 + Math.floor(Math.random() * 30)
  const lightness = 40 + Math.floor(Math.random() * 30)
  
  return hslToHex(hue, saturation, lightness)
}

function generateRandomPalette() {
  // Генерируем случайный базовый цвет
  const randomHue = Math.floor(Math.random() * 360)
  baseColor.value = hslToHex(randomHue, 70, 50).hex
  
  // Генерируем палитру на основе случайного цвета
  generateFromBaseColor()
}

function generateFromBaseColor() {
  const newColors = generateHarmonyPalette(
    baseColor.value, 
    harmonyType.value, 
    colorCount.value
  )
  
  updateColorsWithLocks(newColors)
}

function handleMoodPalette() {
  const newColors = generateMoodPalette(moodType.value, colorCount.value)
  
  updateColorsWithLocks(newColors)
}

// Обновление цветов с сохранением заблокированных
function updateColorsWithLocks(newHexColors) {
  const newColors = []
  const lockedColors = colors.value.filter(color => color.locked)
  
  for (let i = 0; i < colorCount.value; i++) {
    if (i < lockedColors.length && i < colors.value.length && colors.value[i].locked) {
      // Сохраняем заблокированный цвет
      newColors.push({...colors.value[i]})
    } else {
      // Создаем новый цвет
      const hex = newHexColors[i] || generateRandomColor().hex
      newColors.push({
        hex,
        rgb: hexToRGB(hex),
        locked: false,
        copied: false
      })
    }
  }
  
  colors.value = newColors
  saveCurrentPalette()
}

// Функции управления цветами
function toggleLock(index) {
  colors.value[index].locked = !colors.value[index].locked
  saveCurrentPalette()
}

function copyToClipboard(color) {
  const textToCopy = colorFormat.value === 'hex' ? color.hex : color.rgb
  
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

// Работа с библиотекой и сохранением
function saveToLibrary() {
  const savedPalettes = JSON.parse(localStorage.getItem('paletteLibrary') || '[]')
  const palette = {
    id: Date.now(),
    name: paletteName.value || `Палитра ${new Date().toLocaleDateString()}`,
    colors: colors.value,
    createdAt: new Date().toISOString(),
    tags: [harmonyType.value, moodType.value],
    baseColor: baseColor.value
  }
  
  savedPalettes.push(palette)
  localStorage.setItem('paletteLibrary', JSON.stringify(savedPalettes))
  
  // Показать уведомление
  showSavedNotification.value = true
  setTimeout(() => {
    showSavedNotification.value = false
  }, 2000)
}

function saveCurrentPalette() {
  const paletteToSave = colors.value.map(color => ({
    hex: color.hex,
    rgb: color.rgb,
    locked: color.locked
  }))
  
  localStorage.setItem('currentPalette', JSON.stringify(paletteToSave))
  localStorage.setItem('colorCount', colorCount.value)
  localStorage.setItem('colorFormat', colorFormat.value)
  localStorage.setItem('baseColor', baseColor.value)
  localStorage.setItem('harmonyType', harmonyType.value)
  localStorage.setItem('moodType', moodType.value)
  
  showSavedNotification.value = true
  setTimeout(() => {
    showSavedNotification.value = false
  }, 1500)
}

function loadPaletteFromStorage() {
  const savedPalette = localStorage.getItem('currentPalette')
  const savedCount = localStorage.getItem('colorCount')
  const savedFormat = localStorage.getItem('colorFormat')
  const savedBaseColor = localStorage.getItem('baseColor')
  const savedHarmonyType = localStorage.getItem('harmonyType')
  const savedMoodType = localStorage.getItem('moodType')
  
  if (savedPalette) {
    colors.value = JSON.parse(savedPalette)
  }
  
  if (savedCount) {
    colorCount.value = parseInt(savedCount)
  }
  
  if (savedFormat) {
    colorFormat.value = savedFormat
  }
  
  if (savedBaseColor) {
    baseColor.value = savedBaseColor
  }
  
  if (savedHarmonyType) {
    harmonyType.value = savedHarmonyType
  }
  
  if (savedMoodType) {
    moodType.value = savedMoodType
  }
}

function handleColorCountChange() {
  if (colors.value.length < colorCount.value) {
    // Добавляем новые цвета
    for (let i = colors.value.length; i < colorCount.value; i++) {
      colors.value.push(generateRandomColor())
    }
  } else if (colors.value.length > colorCount.value) {
    // Убираем цвета, но сохраняем заблокированные
    const lockedColors = colors.value.filter(color => color.locked)
    const newLength = Math.max(colorCount.value, lockedColors.length)
    
    colors.value = colors.value.slice(0, newLength)
  }
  
  saveCurrentPalette()
}

// Шаринг
function generateShareLink() {
  shareLink.value = generateShareableLink(colors.value, paletteName.value)
}

function copyShareLink() {
  navigator.clipboard.writeText(shareLink.value)
    .then(() => alert('Ссылка скопирована в буфер обмена!'))
    .catch(err => console.error('Ошибка копирования:', err))
}

function handleColorSelected(color) {
  baseColor.value = color
  generateFromBaseColor()
}

// Вспомогательные функции
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
    rgb: `rgb(${r}, ${g}, ${b})`
  }
}

function hexToRGB(hex) {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgb(${r}, ${g}, ${b})`
}

// Инициализация
onMounted(() => {
  loadPaletteFromStorage()
  
  if (colors.value.length === 0) {
    generateFromBaseColor()
  }
})

// Наблюдатели
watch(colorFormat, () => {
  saveCurrentPalette()
})
</script>

<style scoped>
/* Минималистичный черно-белый дизайн */
.generator-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #000;
  line-height: 1.5;
}

/* Убираем все градиенты, тени, закругления */
.advanced-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  padding: 25px;
  background: #fff;
  border: 1px solid #e0e0e0;
}

.basic-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  margin-bottom: 15px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e0e0e0;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-weight: 500;
  color: #000;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

input[type="color"] {
  width: 60px;
  height: 40px;
  border: 1px solid #000;
  cursor: pointer;
  background: transparent;
}

.color-value {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #666;
}

input[type="text"] {
  padding: 10px 15px;
  border: 1px solid #000;
  font-size: 14px;
  background: #fff;
}

select {
  padding: 10px 15px;
  border: 1px solid #000;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%23000' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 12px;
}

.format-toggle {
  display: flex;
  border: 1px solid #000;
}

.format-btn {
  padding: 10px 20px;
  border: none;
  background: #fff;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  flex: 1;
  transition: all 0.2s;
}

.format-btn.active {
  background: #000;
  color: #fff;
}

.format-btn:not(.active):hover {
  background: #f5f5f5;
}

.btn {
  padding: 12px 24px;
  border: 1px solid #000;
  background: #fff;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s;
}

.btn:hover {
  background: #000;
  color: #fff;
}

.generate-btn {
  background: #fff;
  border: 1px solid #000;
}

.save-btn {
  background: #f5f5f5;
}

.info-text {
  color: #666;
  font-size: 13px;
  margin-bottom: 20px;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

/* Отображение палитры */
.palette-section {
  margin-bottom: 40px;
}

.palette-container {
  display: flex;
  border: 1px solid #e0e0e0;
  height: 160px;
}

.color-card {
  flex: 1;
  position: relative;
  cursor: pointer;
  transition: flex 0.2s;
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
  border: 2px solid #000;
}

.color-info {
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
}

.color-value {
  font-family: 'Courier New', monospace;
  font-weight: 500;
  font-size: 12px;
  color: #000;
}

.lock-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #000;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.color-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 500;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.color-overlay.show {
  opacity: 1;
}

/* Анализ контрастности */
.contrast-analysis {
  margin: 40px 0;
  padding: 25px;
  border: 1px solid #e0e0e0;
}

.contrast-analysis h3 {
  margin-bottom: 20px;
  font-weight: 500;
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.contrast-grid {
  display: grid;
  gap: 1px;
  background: #e0e0e0;
}

.contrast-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1px;
}

.contrast-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  position: relative;
  background: #fff;
}

.contrast-value {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 2px;
}

.contrast-value.excellent {
  color: #fff;
}

.contrast-value.good {
  color: #fff;
}

.contrast-value.acceptable {
  color: #fff;
}

.contrast-value.poor {
  color: #fff;
}

.contrast-level {
  font-size: 10px;
  opacity: 0.9;
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
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.preview-header h2 {
  font-weight: 500;
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.preview-controls {
  display: flex;
  gap: 10px;
}

.bg-toggle-btn {
  padding: 8px 16px;
  border: 1px solid #000;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bg-toggle-btn.active {
  background: #000;
  color: #fff;
}

.preview-container {
  border: 1px solid #e0e0e0;
  margin-bottom: 15px;
}

.preview-container.light {
  background: #fafafa;
}

.preview-container.dark {
  background: #222;
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
  color: #fff;
}

.mockup-title {
  font-size: 18px;
  margin: 0;
  font-weight: 500;
}

.mockup-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #fff;
  color: #fff;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  color: #fff;
}

.mockup-card h4 {
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
}

.mockup-card p {
  margin-bottom: 20px;
  line-height: 1.5;
  font-size: 14px;
}

.mockup-card-btn {
  background: #fff;
  color: #000;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mockup-sidebar {
  flex: 1;
  padding: 20px;
  color: #fff;
}

.mockup-sidebar h4 {
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
}

.mockup-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mockup-sidebar li {
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
}

.mockup-footer {
  padding: 15px 20px;
  color: #fff;
  text-align: center;
  font-size: 13px;
}

/* Шаринг */
.sharing-section {
  padding: 25px;
  border: 1px solid #e0e0e0;
  margin-bottom: 40px;
}

.share-link {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.share-link input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #000;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  background: #fff;
}

.copy-link-btn {
  padding: 12px 20px;
  background: #f5f5f5;
  color: #000;
  border: 1px solid #000;
}

/* Уведомления */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  font-weight: 500;
  z-index: 1000;
  border: 1px solid #000;
  font-size: 14px;
}

.saved-notification {
  background: #fff;
  color: #000;
}

.copy-notification {
  background: #fff;
  color: #000;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
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
  
  .basic-controls {
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
  
  .contrast-row {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .advanced-controls {
    grid-template-columns: 1fr;
  }
  
  .generator-container {
    padding: 10px;
  }
}
</style>