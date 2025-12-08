<template>
  <div class="analysis-container">
    <div class="analysis-header">
      <h1> Анализ доступности</h1>
      <p>Проверьте контрастность цветов по стандарту WCAG 2.1</p>
    </div>
    
    <div class="contrast-checker">
      <h2>Проверка контрастности</h2>
      
      <div class="color-inputs">
        <div class="color-input">
          <label>Цвет текста</label>
          <input type="color" v-model="textColor">
          <input type="text" v-model="textColor" class="color-hex">
        </div>
        
        <div class="vs-icon">
          <i class="fas fa-arrows-alt-h"></i>
        </div>
        
        <div class="color-input">
          <label>Цвет фона</label>
          <input type="color" v-model="backgroundColor">
          <input type="text" v-model="backgroundColor" class="color-hex">
        </div>
      </div>
      
      <div class="contrast-results">
        <div class="result-card" :class="getContrastClass(contrastResults.ratio)">
          <div class="result-title">Коэффициент контрастности</div>
          <div class="result-value">{{ contrastResults.ratio }}:1</div>
          <div class="result-level">{{ contrastResults.level }}</div>
        </div>
        
        <div class="result-card" :class="contrastResults.meetsAA ? 'success' : 'error'">
          <div class="result-title">WCAG AA</div>
          <div class="result-value">{{ contrastResults.meetsAA ? '✅' : '❌' }}</div>
          <div class="result-level">Мин. 4.5:1</div>
        </div>
        
        <div class="result-card" :class="contrastResults.meetsAAA ? 'success' : 'error'">
          <div class="result-title">WCAG AAA</div>
          <div class="result-value">{{ contrastResults.meetsAAA ? '✅' : '❌' }}</div>
          <div class="result-level">Мин. 7.0:1</div>
        </div>
      </div>
      
      <div class="preview-section">
        <div class="preview-box" :style="{ backgroundColor: backgroundColor }">
          <p :style="{ color: textColor }" class="preview-text">
            Пример текста с выбранными цветами. Это демонстрация читаемости.
          </p>
          <button 
            class="preview-button"
            :style="{ 
              backgroundColor: textColor,
              color: backgroundColor
            }"
          >
            Пример кнопки
          </button>
        </div>
      </div>
    </div>
    
    <div class="suggestions-section">
      <h2>Подбор акцентных цветов</h2>
      
      <div class="suggestions-grid">
        <div 
          v-for="suggestion in colorSuggestions"
          :key="suggestion.type"
          class="suggestion-card"
        >
          <div class="suggestion-header">
            <h3>{{ suggestion.title }}</h3>
            <span class="contrast-badge" :class="getContrastClass(suggestion.contrast)">
              {{ suggestion.contrast }}:1
            </span>
          </div>
          
          <div class="suggestion-colors">
            <div 
              v-for="color in suggestion.colors"
              :key="color"
              class="suggestion-color"
              :style="{ backgroundColor: color }"
              :title="color"
              @click="selectSuggestionColor(color)"
            >
              <span class="color-hex">{{ color }}</span>
            </div>
          </div>
          
          <p class="suggestion-desc">{{ suggestion.description }}</p>
        </div>
      </div>
    </div>
    
    <div class="wcag-info">
      <h3><i class="fas fa-info-circle"></i> О стандарте WCAG 2.1</h3>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-title">Уровень AA (4.5:1)</div>
          <p>Минимальный уровень доступности для обычного текста</p>
        </div>
        <div class="info-item">
          <div class="info-title">Уровень AAA (7:1)</div>
          <p>Повышенный уровень доступности для требовательных пользователей</p>
        </div>
        <div class="info-item">
          <div class="info-title">Крупный текст (3:1)</div>
          <p>Для текста размером более 18pt (24px) норматив ниже</p>
        </div>
        <div class="info-item">
          <div class="info-title">Элементы UI</div>
          <p>Для кнопок, иконок и границ - минимум 3:1</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { calculateContrast } from '../utils/colorUtils'

const textColor = ref('#000000')
const backgroundColor = ref('#ffffff')

const contrastResults = computed(() => {
  return calculateContrast(textColor.value, backgroundColor.value)
})

const colorSuggestions = computed(() => {
  const baseColor = textColor.value
  const suggestions = [
    {
      type: 'light',
      title: 'Светлые акценты',
      description: 'Подходит для темного фона',
      colors: generateTints(baseColor, 3),
      contrast: calculateContrast(lightenColor(baseColor, 0.8), backgroundColor.value).ratio
    },
    {
      type: 'dark',
      title: 'Темные акценты',
      description: 'Подходит для светлого фона',
      colors: generateShades(baseColor, 3),
      contrast: calculateContrast(darkenColor(baseColor, 0.8), backgroundColor.value).ratio
    },
    {
      type: 'complementary',
      title: 'Комплементарные',
      description: 'Противоположные цвета для контраста',
      colors: generateComplementary(baseColor, 3),
      contrast: calculateContrast(getComplementary(baseColor), backgroundColor.value).ratio
    },
    {
      type: 'analogous',
      title: 'Аналогичные',
      description: 'Гармоничные сочетания',
      colors: generateAnalogous(baseColor, 3),
      contrast: calculateContrast(getAnalogous(baseColor)[0], backgroundColor.value).ratio
    }
  ]
  return suggestions
})

function getContrastClass(ratio) {
  if (ratio >= 7) return 'excellent'
  if (ratio >= 4.5) return 'good'
  if (ratio >= 3) return 'acceptable'
  return 'poor'
}

function lightenColor(hex, amount) {
  hex = hex.replace('#', '')
  const num = parseInt(hex, 16)
  const r = Math.min(255, ((num >> 16) & 255) + Math.round(amount * 255))
  const g = Math.min(255, ((num >> 8) & 255) + Math.round(amount * 255))
  const b = Math.min(255, (num & 255) + Math.round(amount * 255))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function darkenColor(hex, amount) {
  hex = hex.replace('#', '')
  const num = parseInt(hex, 16)
  const r = Math.max(0, ((num >> 16) & 255) - Math.round(amount * 255))
  const g = Math.max(0, ((num >> 8) & 255) - Math.round(amount * 255))
  const b = Math.max(0, (num & 255) - Math.round(amount * 255))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function generateTints(baseColor, count) {
  const tints = []
  for (let i = 1; i <= count; i++) {
    tints.push(lightenColor(baseColor, i * 0.2))
  }
  return tints
}

function generateShades(baseColor, count) {
  const shades = []
  for (let i = 1; i <= count; i++) {
    shades.push(darkenColor(baseColor, i * 0.2))
  }
  return shades
}

function getComplementary(color) {
  // Простая реализация получения комплементарного цвета
  const hex = color.replace('#', '')
  const num = parseInt(hex, 16)
  const r = 255 - ((num >> 16) & 255)
  const g = 255 - ((num >> 8) & 255)
  const b = 255 - (num & 255)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function generateComplementary(baseColor, count) {
  const colors = [baseColor, getComplementary(baseColor)]
  while (colors.length < count) {
    colors.push(lightenColor(baseColor, Math.random() * 0.5))
  }
  return colors
}

function getAnalogous(color) {
  // Получаем аналогичные цвета (±30 градусов)
  return [
    lightenColor(color, 0.3),
    color,
    darkenColor(color, 0.3)
  ]
}

function generateAnalogous(baseColor, count) {
  const colors = getAnalogous(baseColor)
  while (colors.length < count) {
    colors.push(lightenColor(baseColor, Math.random() * 0.6))
  }
  return colors
}

function selectSuggestionColor(color) {
  textColor.value = color
}
</script>

<style scoped>
.analysis-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.analysis-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.analysis-header h1 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
  color: #2c3e50;
}

.contrast-checker {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
}

.contrast-checker h2 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.color-inputs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;
}

.color-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.color-input label {
  font-weight: 600;
  color: #2c3e50;
}

.color-input input[type="color"] {
  width: 80px;
  height: 80px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.color-hex {
  padding: 8px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  text-align: center;
  min-width: 120px;
}

.vs-icon {
  font-size: 2rem;
  color: #7f8c8d;
}

.contrast-results {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.result-card {
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  background: #f8f9fa;
  border: 2px solid transparent;
}

.result-card.excellent {
  border-color: #2ecc71;
  background: #f0f9f2;
}

.result-card.good {
  border-color: #3498db;
  background: #f0f7ff;
}

.result-card.acceptable {
  border-color: #f1c40f;
  background: #fef9e7;
}

.result-card.poor {
  border-color: #e74c3c;
  background: #fdf2f0;
}

.result-card.success {
  border-color: #2ecc71;
  background: #f0f9f2;
}

.result-card.error {
  border-color: #e74c3c;
  background: #fdf2f0;
}

.result-title {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 10px;
}

.result-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: #2c3e50;
}

.result-level {
  font-size: 0.9rem;
  font-weight: 600;
}

.preview-section {
  margin-top: 40px;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 12px;
}

.preview-box {
  padding: 40px;
  border-radius: 8px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.preview-text {
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  margin: 0;
}

.preview-button {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.preview-button:hover {
  transform: translateY(-2px);
}

.suggestions-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
}

.suggestions-section h2 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.suggestion-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.3s;
}

.suggestion-card:hover {
  transform: translateY(-5px);
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.suggestion-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.contrast-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #e9ecef;
  color: #495057;
}

.suggestion-colors {
  display: flex;
  margin-bottom: 15px;
}

.suggestion-color {
  flex: 1;
  aspect-ratio: 1;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
}

.suggestion-color:hover {
  transform: scale(1.1);
  z-index: 2;
}

.suggestion-color .color-hex {
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
  text-align: center;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.suggestion-desc {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.wcag-info {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.wcag-info h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
  color: #2c3e50;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #4a6fa5;
}

.info-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.info-item p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}
</style>