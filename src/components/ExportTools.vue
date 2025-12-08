<template>
  <div class="export-container">
    <div class="export-header">
      <h1>Экспорт палитр</h1>
      <p v-if="paletteName">Палитра: <strong>{{ paletteName }}</strong></p>
      <p v-else>Экспортируйте текущую палитру в популярные форматы CSS</p>
    </div>
    
    <div class="current-palette">
      <h2>Экспортируемая палитра</h2>
      <div class="current-colors">
        <div 
          v-for="(color, index) in currentColors" 
          :key="index"
          class="current-color"
          :style="{ backgroundColor: color.hex }"
          :title="color.hex"
        >
          <span class="color-hex">{{ color.hex }}</span>
        </div>
      </div>
    </div>
    
    <div class="export-formats">
      <div class="format-section">
        <div class="format-header">
          <h3>CSS Variables</h3>
          <button class="copy-btn" @click="copyCSS">
            Копировать
          </button>
        </div>
        <div class="code-block">
          <pre class="code-content">{{ cssCode }}</pre>
        </div>
      </div>
      
      <div class="format-section">
        <div class="format-header">
          <h3>SCSS Variables</h3>
          <button class="copy-btn" @click="copySCSS">
            Копировать
          </button>
        </div>
        <div class="code-block">
          <pre class="code-content">{{ scssCode }}</pre>
        </div>
      </div>
      
      <div class="format-section">
        <div class="format-header">
          <h3>Tailwind Config</h3>
          <button class="copy-btn" @click="copyTailwind">
            Копировать
          </button>
        </div>
        <div class="code-block">
          <pre class="code-content">{{ tailwindCode }}</pre>
        </div>
      </div>
      
      <div class="format-section">
        <div class="format-header">
          <h3>JSON</h3>
          <button class="copy-btn" @click="copyJSON">
            Копировать
          </button>
        </div>
        <div class="code-block">
          <pre class="code-content">{{ jsonCode }}</pre>
        </div>
      </div>
    </div>
    
    <div class="export-actions">
      <button class="btn btn-secondary" @click="goBack">
        <i class="fas fa-arrow-left"></i> Назад в библиотеку
      </button>
      <button class="btn btn-primary" @click="copyAllFormats">
        <i class="fas fa-copy"></i> Копировать все форматы
      </button>
    </div>
    
    <!-- Уведомление о копировании -->
    <transition name="fade">
      <div v-if="showCopyNotification" class="notification">
        {{ copyNotificationText }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentColors = ref([])
const paletteName = ref('')
const showCopyNotification = ref(false)
const copyNotificationText = ref('')

const cssCode = computed(() => {
  if (currentColors.value.length === 0) return '/* Загрузите палитру */'
  
  let code = '/* CSS Custom Properties */\n'
  code += ':root {\n'
  currentColors.value.forEach((color, index) => {
    const hex = color.hex || color
    code += `  --color-primary-${index + 1}: ${hex};\n`
  })
  code += '}\n\n'
  
  code += '/* Использование: */\n'
  currentColors.value.forEach((color, index) => {
    const hex = color.hex || color
    code += `.element-${index + 1} {\n`
    code += `  color: var(--color-primary-${index + 1});\n`
    code += `  background-color: var(--color-primary-${index + 1});\n`
    code += `  border-color: var(--color-primary-${index + 1});\n`
    code += '}\n\n'
  })
  
  return code
})

const scssCode = computed(() => {
  if (currentColors.value.length === 0) return '// Загрузите палитру'
  
  let code = '// SCSS Variables\n'
  code += '// Основные цвета палитры\n'
  currentColors.value.forEach((color, index) => {
    const hex = color.hex || color
    code += `$color-primary-${index + 1}: ${hex};\n`
  })
  
  code += '\n// Карта цветов для использования в циклах\n'
  code += '$palette: (\n'
  currentColors.value.forEach((color, index) => {
    const hex = color.hex || color
    code += `  'primary-${index + 1}': $color-primary-${index + 1},\n`
  })
  code += ');\n\n'
  
  code += '// Миксин для генерации классов\n'
  code += '@mixin palette-classes {\n'
  currentColors.value.forEach((color, index) => {
    code += `  .color-primary-${index + 1} {\n`
    code += `    color: $color-primary-${index + 1};\n`
    code += `  }\n`
    code += `  .bg-primary-${index + 1} {\n`
    code += `    background-color: $color-primary-${index + 1};\n`
    code += `  }\n`
  })
  code += '}\n'
  
  return code
})

const tailwindCode = computed(() => {
  if (currentColors.value.length === 0) return '// Загрузите палитру'
  
  let code = '// tailwind.config.js\n'
  code += 'module.exports = {\n'
  code += '  theme: {\n'
  code += '    extend: {\n'
  code += '      colors: {\n'
  
  currentColors.value.forEach((color, index) => {
    const hex = color.hex || color
    code += `        primary${index + 1}: '${hex}',\n`
  })
  
  code += '      },\n'
  code += '      textColor: {\n'
  currentColors.value.forEach((color, index) => {
    const hex = color.hex || color
    code += `        primary${index + 1}: '${hex}',\n`
  })
  code += '      },\n'
  code += '      backgroundColor: {\n'
  currentColors.value.forEach((color, index) => {
    const hex = color.hex || color
    code += `        primary${index + 1}: '${hex}',\n`
  })
  code += '      },\n'
  code += '      borderColor: {\n'
  currentColors.value.forEach((color, index) => {
    const hex = color.hex || color
    code += `        primary${index + 1}: '${hex}',\n`
  })
  code += '      }\n'
  code += '    }\n'
  code += '  }\n'
  code += '}\n\n'
  
  code += '// Использование в классах Tailwind:\n'
  currentColors.value.forEach((color, index) => {
    const i = index + 1
    code += `// text-primary${i}\n`
    code += `// bg-primary${i}\n`
    code += `// border-primary${i}\n`
  })
  
  return code
})

const jsonCode = computed(() => {
  if (currentColors.value.length === 0) return '{}'
  
  const paletteData = {
    name: paletteName.value || 'Экспортированная палитра',
    colors: currentColors.value.map(color => color.hex || color),
    createdAt: new Date().toISOString(),
    exportFormats: {
      css: cssCode.value,
      scss: scssCode.value,
      tailwind: tailwindCode.value
    }
  }
  
  return JSON.stringify(paletteData, null, 2)
})

onMounted(() => {
  loadExportedPalette()
})

function loadExportedPalette() {
  try {
    // Пытаемся загрузить палитру из localStorage
    const saved = localStorage.getItem('exportPalette')
    
    if (saved) {
      const palette = JSON.parse(saved)
      paletteName.value = palette.name || 'Экспортированная палитра'
      
      // Убеждаемся, что colors - это массив объектов с hex
      if (palette.colors && Array.isArray(palette.colors)) {
        currentColors.value = palette.colors.map(color => {
          if (typeof color === 'string') {
            return { hex: color }
          } else if (color && color.hex) {
            return { hex: color.hex }
          }
          return { hex: '#FFFFFF' }
        })
      } else {
        // Если нет colors, создаем пустую палитру
        currentColors.value = []
      }
    } else {
      // Если нет сохраненной палитры, загружаем текущую из localStorage
      const savedCurrent = localStorage.getItem('currentPalette')
      currentColors.value = savedCurrent ? JSON.parse(savedCurrent) : []
      paletteName.value = 'Текущая палитра'
    }
  } catch (error) {
    console.error('Ошибка загрузки палитры:', error)
    currentColors.value = []
    paletteName.value = 'Текущая палитра'
  }
}

function copyCSS() {
  navigator.clipboard.writeText(cssCode.value)
    .then(() => {
      showNotification('CSS переменные скопированы в буфер обмена')
    })
    .catch(err => {
      console.error('Ошибка копирования:', err)
      showNotification('Ошибка копирования')
    })
}

function copySCSS() {
  navigator.clipboard.writeText(scssCode.value)
    .then(() => {
      showNotification('SCSS переменные скопированы в буфер обмена')
    })
    .catch(err => {
      console.error('Ошибка копирования:', err)
      showNotification('Ошибка копирования')
    })
}

function copyTailwind() {
  navigator.clipboard.writeText(tailwindCode.value)
    .then(() => {
      showNotification('Tailwind конфигурация скопирована в буфер обмена')
    })
    .catch(err => {
      console.error('Ошибка копирования:', err)
      showNotification('Ошибка копирования')
    })
}

function copyJSON() {
  navigator.clipboard.writeText(jsonCode.value)
    .then(() => {
      showNotification('JSON палитры скопирован в буфер обмена')
    })
    .catch(err => {
      console.error('Ошибка копирования:', err)
      showNotification('Ошибка копирования')
    })
}

function copyAllFormats() {
  const allFormats = `=== CSS Variables ===\n\n${cssCode.value}\n\n=== SCSS Variables ===\n\n${scssCode.value}\n\n=== Tailwind Config ===\n\n${tailwindCode.value}\n\n=== JSON ===\n\n${jsonCode.value}`
  
  navigator.clipboard.writeText(allFormats)
    .then(() => {
      showNotification('Все форматы скопированы в буфер обмена')
    })
    .catch(err => {
      console.error('Ошибка копирования:', err)
      showNotification('Ошибка копирования')
    })
}

function showNotification(message) {
  copyNotificationText.value = message
  showCopyNotification.value = true
  
  setTimeout(() => {
    showCopyNotification.value = false
  }, 2000)
}

function goBack() {
  router.push('/library')
}
</script>

<style scoped>
.export-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.export-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.export-header h1 {
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.export-header p {
  color: #666;
  font-size: 14px;
}

.export-header strong {
  color: #4a6fa5;
  font-weight: 600;
}

.current-palette {
  margin-bottom: 40px;
  padding: 25px;
  border: 1px solid #e0e0e0;
  background: #fff;
}

.current-palette h2 {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.current-colors {
  display: flex;
  height: 100px;
}

.current-color {
  flex: 1;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 10px;
  transition: transform 0.2s;
}

.current-color:hover {
  transform: scale(1.05);
  z-index: 2;
}

.color-hex {
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.export-formats {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 40px;
}

.format-section {
  border: 1px solid #e0e0e0;
  background: #fff;
}

.format-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.format-header h3 {
  font-size: 18px;
  font-weight: 500;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.copy-btn {
  padding: 8px 16px;
  border: 1px solid #000;
  background: #fff;
  color: #000;
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #000;
  color: #fff;
}

.code-block {
  padding: 25px;
  background: #fafafa;
  max-height: 400px;
  overflow-y: auto;
}

.code-content {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #000;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.export-actions {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-primary {
  background: #4a6fa5;
  color: white;
}

.btn-primary:hover {
  background: #3a5a8c;
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 25px;
  background: #000;
  color: #fff;
  font-weight: 500;
  font-size: 14px;
  z-index: 1000;
  border: 1px solid #000;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .export-container {
    padding: 10px;
  }
  
  .current-colors {
    flex-direction: column;
    height: auto;
  }
  
  .current-color {
    height: 60px;
  }
  
  .code-block {
    padding: 15px;
  }
  
  .code-content {
    font-size: 11px;
  }
  
  .export-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>