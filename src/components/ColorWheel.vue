<template>
  <div class="color-wheel-container">
    <h3><i class="fas fa-circle"></i> Цветовой круг</h3>
    <div class="color-wheel" ref="wheelRef">
      <div 
        v-for="(color, index) in wheelColors"
        :key="index"
        class="wheel-segment"
        :style="getSegmentStyle(index)"
        @click="selectColor(color)"
      >
        <div class="segment-color" :style="{ backgroundColor: color }"></div>
        <div v-if="isHarmonyColor(index)" class="harmony-marker">
          <i class="fas fa-star"></i>
        </div>
      </div>
      <div class="wheel-center" :style="{ backgroundColor: baseColor }">
        <div class="center-label">Базовый</div>
      </div>
    </div>
    <div class="harmony-info">
      <p>Тип гармонии: {{ harmonyLabels[harmonyType] }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  colors: Array,
  baseColor: String,
  harmonyType: String
})

const emit = defineEmits(['color-selected'])

const wheelRef = ref(null)
const segmentCount = 24

const wheelColors = computed(() => {
  const colors = []
  for (let i = 0; i < segmentCount; i++) {
    const hue = (i * 360) / segmentCount
    const hex = hslToHex(hue, 70, 50)
    colors.push(hex)
  }
  return colors
})

const harmonyLabels = {
  analogous: 'Аналогичная (соседние цвета)',
  monochromatic: 'Монохромная (оттенки одного цвета)',
  triadic: 'Триада (3 равноудаленных цвета)',
  complementary: 'Комплементарная (противоположные цвета)',
  tetradic: 'Тетрадная (4 равноудаленных цвета)'
}

function getSegmentStyle(index) {
  const angle = (360 / segmentCount) * index
  return {
    transform: `rotate(${angle}deg)`,
    'clip-path': 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)'
  }
}

function isHarmonyColor(index) {
  const baseHue = getHueFromHex(props.baseColor)
  const currentHue = (index * 360) / segmentCount
  
  switch (props.harmonyType) {
    case 'analogous':
      return Math.abs(currentHue - baseHue) <= 30 ||
             Math.abs(currentHue - baseHue + 360) <= 30 ||
             Math.abs(currentHue - baseHue - 360) <= 30
    case 'complementary':
      return Math.abs(Math.abs(currentHue - baseHue) - 180) <= 15
    case 'triadic':
      return Math.abs(Math.abs(currentHue - baseHue) - 120) <= 15 ||
             Math.abs(Math.abs(currentHue - baseHue) - 240) <= 15
    case 'tetradic':
      return Math.abs(Math.abs(currentHue - baseHue) - 90) <= 15 ||
             Math.abs(Math.abs(currentHue - baseHue) - 180) <= 15 ||
             Math.abs(Math.abs(currentHue - baseHue) - 270) <= 15
    default:
      return false
  }
}

function selectColor(color) {
  emit('color-selected', color)
}

function getHueFromHex(hex) {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  
  let h = 0
  if (max === min) {
    h = 0
  } else {
    const d = max - min
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return h * 360
}

function hslToHex(h, s, l) {
  h /= 360
  s /= 100
  l /= 100
  
  let r, g, b
  
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
</script>

<style scoped>
.color-wheel-container {
  padding: 25px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.color-wheel-container h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: #2c3e50;
}

.color-wheel {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
}

.wheel-segment {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.wheel-segment:hover {
  transform: scale(1.1);
}

.segment-color {
  position: absolute;
  top: 20%;
  left: 20%;
  right: 0;
  bottom: 0;
}

.harmony-marker {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 12px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.center-label {
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.harmony-info {
  text-align: center;
  margin-top: 20px;
  color: #666;
}
</style>