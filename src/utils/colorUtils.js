// colorUtils.js

// Функция для расчета контрастности WCAG
export function calculateContrast(color1, color2) {
  // Конвертируем HEX в RGB
  const hexToRgb = (hex) => {
    hex = hex.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return { r, g, b }
  }

  // Рассчитываем относительную яркость
  const getLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  const contrast = (brightest + 0.05) / (darkest + 0.05)

  // Определяем уровень контраста
  let level = 'Insufficient'
  if (contrast >= 7) {
    level = 'AAA'
  } else if (contrast >= 4.5) {
    level = 'AA'
  } else if (contrast >= 3) {
    level = 'AA Large'
  }

  return {
    ratio: contrast.toFixed(2),
    level: level
  }
}

// Функция для генерации гармоничной палитры
export function generateHarmonyPalette(baseColor, harmonyType, count) {
  // Конвертируем HEX в HSL
  const hexToHsl = (hex) => {
    hex = hex.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0 // achromatic
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  // Конвертируем HSL в HEX
  const hslToHex = (h, s, l) => {
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
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
  }

  const baseHsl = hexToHsl(baseColor)
  const colors = [baseColor]

  // Генерируем цвета на основе выбранной гармонии
  for (let i = 1; i < count; i++) {
    let hue = baseHsl.h
    let saturation = baseHsl.s
    let lightness = baseHsl.l

    switch (harmonyType) {
      case 'analogous':
        hue = (baseHsl.h + 30 * i) % 360
        break
      case 'monochromatic':
        lightness = Math.max(20, Math.min(80, baseHsl.l + (i % 2 === 0 ? 15 : -15) * i))
        break
      case 'triadic':
        hue = (baseHsl.h + 120 * i) % 360
        break
      case 'complementary':
        hue = (baseHsl.h + 180) % 360
        break
      case 'tetradic':
        hue = (baseHsl.h + 90 * i) % 360
        break
      default:
        hue = (baseHsl.h + 60 * i) % 360
    }

    colors.push(hslToHex(hue, saturation, lightness))
  }

  return colors.slice(0, count)
}

// Функция для генерации палитры по настроению
export function generateMoodPalette(moodType, count) {
  const moodPresets = {
    calm: [
      { h: 210, s: 40, l: 60 },
      { h: 180, s: 30, l: 70 },
      { h: 150, s: 25, l: 65 }
    ],
    energetic: [
      { h: 0, s: 80, l: 60 },
      { h: 30, s: 85, l: 55 },
      { h: 330, s: 75, l: 50 }
    ],
    professional: [
      { h: 220, s: 45, l: 40 },
      { h: 200, s: 30, l: 50 },
      { h: 180, s: 25, l: 60 }
    ],
    vibrant: [
      { h: 120, s: 90, l: 50 },
      { h: 60, s: 95, l: 55 },
      { h: 300, s: 85, l: 50 }
    ],
    pastel: [
      { h: 180, s: 50, l: 80 },
      { h: 330, s: 40, l: 85 },
      { h: 90, s: 45, l: 75 }
    ]
  }

  // Конвертируем HSL в HEX
  const hslToHex = (h, s, l) => {
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
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
  }

  const preset = moodPresets[moodType] || moodPresets.calm
  const colors = []

  for (let i = 0; i < count; i++) {
    const color = preset[i % preset.length]
    colors.push(hslToHex(
      color.h + (i * 10),
      Math.max(20, Math.min(color.s + (i * 5), 100)),
      Math.max(20, Math.min(color.l + (i * 3), 80))
    ))
  }

  return colors
}

// Функция для генерации ссылки для шаринга
export function generateShareableLink(colors, paletteName) {
  const hexColors = colors.map(c => c.hex.replace('#', ''))
  const params = new URLSearchParams({
    colors: hexColors.join(','),
    name: paletteName || 'Палитра',
    format: 'hex'
  })
  
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`
}

// Существующие функции для экспорта палитр
export function generateCSSVariables(palette, prefix = 'color') {
  if (!palette || palette.length === 0) {
    return '/* Нет данных о палитре */'
  }
  
  let css = ':root {\n'
  
  palette.forEach((color, index) => {
    const hex = color.hex || color
    css += `  --${prefix}-${index + 1}: ${hex};\n`
  })
  
  css += '}\n\n'
  
  css += '/* Примеры использования: */\n'
  palette.forEach((color, index) => {
    const hex = color.hex || color
    css += `/* .element-${index + 1} { background-color: var(--${prefix}-${index + 1}); } */\n`
  })
  
  return css
}

export function generateSCSSVariables(palette, prefix = 'color') {
  if (!palette || palette.length === 0) {
    return '// Нет данных о палитре'
  }
  
  let scss = '// Основные цвета\n'
  
  palette.forEach((color, index) => {
    const hex = color.hex || color
    scss += `$${prefix}-${index + 1}: ${hex};\n`
  })
  
  scss += '\n// Карта цветов для использования в циклах\n'
  scss += `$${prefix}s: (\n`
  palette.forEach((color, index) => {
    const hex = color.hex || color
    scss += `  '${prefix}-${index + 1}': $${prefix}-${index + 1},\n`
  })
  scss += ');\n\n'
  
  scss += '// Примеры использования:\n'
  palette.forEach((color, index) => {
    const hex = color.hex || color
    scss += `// .element-${index + 1} { background-color: $${prefix}-${index + 1}; }\n`
  })
  
  return scss
}

export function generateTailwindConfig(palette, name = 'custom') {
  if (!palette || palette.length === 0) {
    return '// Нет данных о палитре'
  }
  
  let config = '// tailwind.config.js\n'
  config += 'module.exports = {\n'
  config += '  theme: {\n'
  config += '    extend: {\n'
  config += '      colors: {\n'
  config += `        ${name}: {\n`
  
  palette.forEach((color, index) => {
    const hex = color.hex || color
    const shade = (index + 1) * 100
    config += `          ${shade}: '${hex}',\n`
  })
  
  config += '        }\n'
  config += '      }\n'
  config += '    }\n'
  config += '  }\n'
  config += '}\n\n'
  
  config += '// Примеры использования в классах Tailwind:\n'
  palette.forEach((color, index) => {
    const shade = (index + 1) * 100
    config += `// bg-${name}-${shade}\n`
    config += `// text-${name}-${shade}\n`
    config += `// border-${name}-${shade}\n`
  })
  
  return config
}