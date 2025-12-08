<template>
  <div class="library-container">
    <div class="library-header">
      <h1>Библиотека палитр</h1>
      <div class="search-controls">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Поиск по названию или тегам..."
          class="search-input"
          @input="handleSearch"
        >
        <button class="btn filter-btn" @click="showFilters = !showFilters">
          <i class="fas fa-filter"></i> Фильтры
        </button>
      </div>
      
      <div v-if="showFilters" class="filters-panel">
        <div class="filter-group">
          <label>Тип гармонии:</label>
          <div class="filter-tags">
            <button 
              v-for="type in harmonyTypes"
              :key="type"
              :class="['tag-btn', selectedFilters.harmony.includes(type) ? 'active' : '']"
              @click="toggleHarmonyFilter(type)"
            >
              {{ getRussianHarmony(type) }}
            </button>
          </div>
        </div>
        
        <div class="filter-group">
          <label>Настроение:</label>
          <div class="filter-tags">
            <button 
              v-for="mood in moodTypes"
              :key="mood"
              :class="['tag-btn', selectedFilters.mood.includes(mood) ? 'active' : '']"
              @click="toggleMoodFilter(mood)"
            >
              {{ getRussianMood(mood) }}
            </button>
          </div>
        </div>
        
        <div class="filter-group">
          <label>Дата создания:</label>
          <select v-model="selectedFilters.date">
            <option value="">Все</option>
            <option value="today">Сегодня</option>
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
          </select>
        </div>
      </div>
    </div>
    
    <div v-if="filteredPalettes.length > 0" class="library-stats">
      <p>Найдено палитр: <strong>{{ filteredPalettes.length }}</strong></p>
    </div>
    
    <div class="palettes-grid">
      <div 
        v-for="palette in filteredPalettes"
        :key="palette.id"
        class="palette-card"
      >
        <div class="palette-header">
          <h3>{{ palette.name }}</h3>
          <div class="palette-actions">
            <button class="icon-btn" @click="openEditModal(palette)" title="Редактировать">
              <i class="fas fa-edit"></i>
            </button>
            <button class="icon-btn" @click="openDeleteModal(palette)" title="Удалить">
              <i class="fas fa-trash"></i>
            </button>
            <button class="icon-btn" @click="toggleFavorite(palette.id)" :title="palette.favorite ? 'Удалить из избранного' : 'Добавить в избранное'">
              <i :class="['fas', palette.favorite ? 'fa-star' : 'fa-star']" :style="{ color: palette.favorite ? '#f1c40f' : '#ccc' }"></i>
            </button>
          </div>
        </div>
        
        <div class="palette-colors">
          <div 
            v-for="(color, index) in palette.colors"
            :key="index"
            class="library-color"
            :style="{ backgroundColor: color.hex }"
            :title="color.hex"
          >
            <span class="color-hex">{{ color.hex }}</span>
          </div>
        </div>
        
        <div class="palette-info">
          <div class="palette-tags">
            <!-- Теги теперь кликабельны -->
            <span 
              v-for="tag in getDisplayTags(palette)" 
              :key="tag" 
              class="tag clickable-tag"
              :title="getTagTitle(tag)"
              @click="searchByTag(getOriginalTag(palette, tag))"
            >
              {{ tag }}
            </span>
            
            <!-- Пользовательские теги с кнопкой удаления -->
            <span 
              v-for="customTag in palette.customTags || []" 
              :key="`custom-${customTag}`" 
              class="tag custom-tag"
              :title="customTag"
              @click="searchByTag(customTag)"
            >
              {{ customTag }}
              <button 
                class="tag-remove-btn"
                @click.stop="removeCustomTagFromPalette(palette, customTag)"
                title="Удалить тег"
              >
                <i class="fas fa-times"></i>
              </button>
            </span>
            
            <!-- Кнопка добавления нового тега -->
            <button 
              class="tag add-tag-btn"
              @click="openAddTagModal(palette)"
              title="Добавить тег"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="palette-date">
            {{ formatDate(palette.createdAt) }}
          </div>
        </div>
        
        <div class="palette-footer">
          <button class="btn load-btn" @click="loadPalette(palette)">
            <i class="fas fa-palette"></i> Загрузить
          </button>
          <button class="btn export-btn" @click="exportPalette(palette)">
            <i class="fas fa-download"></i> Экспорт
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="filteredPalettes.length === 0" class="empty-state">
      <i class="fas fa-palette fa-3x"></i>
      <h3>{{ searchQuery ? 'Ничего не найдено' : 'Библиотека пуста' }}</h3>
      <p v-if="searchQuery">Попробуйте изменить поисковый запрос или сбросить фильтры</p>
      <p v-else>Создайте и сохраните свою первую палитру</p>
      <router-link to="/" class="btn create-btn">
        <i class="fas fa-plus"></i> Создать палитру
      </router-link>
    </div>

    <!-- Модальное окно редактирования -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Редактирование палитры</h2>
          <button class="modal-close" @click="closeEditModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="edit-name">Название палитры:</label>
            <input 
              type="text" 
              id="edit-name" 
              v-model="editingPalette.name"
              class="form-input"
              placeholder="Введите название"
            >
          </div>
          
          <div class="form-group">
            <label>Цвета палитры:</label>
            <div class="edit-colors">
              <div 
                v-for="(color, index) in editingPalette.colors"
                :key="index"
                class="edit-color-item"
              >
                <div class="color-preview" :style="{ backgroundColor: color.hex }"></div>
                <input 
                  type="color" 
                  :value="color.hex"
                  @change="(e) => updateColor(index, e.target.value)"
                  class="color-input"
                >
                <input 
                  type="text" 
                  :value="color.hex"
                  @input="(e) => updateColor(index, e.target.value)"
                  class="color-hex-input"
                  placeholder="#FFFFFF"
                >
                <button 
                  class="color-remove"
                  @click="removeColor(index)"
                  v-if="editingPalette.colors.length > 3"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <button class="btn-add-color" @click="addColor">
              <i class="fas fa-plus"></i> Добавить цвет
            </button>
          </div>
          
          <div class="form-group">
            <label>Тип гармонии:</label>
            <div class="tag-selector">
              <button 
                v-for="type in harmonyTypes"
                :key="type"
                :class="['tag-option', editingPalette.tags.includes(type) ? 'selected' : '']"
                @click="toggleTag(type)"
              >
                {{ getRussianHarmony(type) }}
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>Настроение:</label>
            <div class="tag-selector">
              <button 
                v-for="mood in moodTypes"
                :key="mood"
                :class="['tag-option', editingPalette.tags.includes(mood) ? 'selected' : '']"
                @click="toggleTag(mood)"
              >
                {{ getRussianMood(mood) }}
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>Дополнительные теги:</label>
            <div class="tags-input">
              <input 
                type="text" 
                v-model="newTag"
                @keyup.enter="addCustomTag"
                class="tag-input"
                placeholder="Введите тег и нажмите Enter"
              >
              <div class="custom-tags">
                <span 
                  v-for="(tag, index) in editingPalette.customTags"
                  :key="`custom-${index}`"
                  class="custom-tag"
                >
                  {{ tag }}
                  <button @click="removeCustomTag(index)" class="tag-remove">
                    <i class="fas fa-times"></i>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeEditModal">
            Отмена
          </button>
          <button class="btn btn-save" @click="saveEditedPalette">
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления тега -->
    <div v-if="showAddTagModal" class="modal-overlay" @click="closeAddTagModal">
      <div class="modal-content tag-modal" @click.stop>
        <div class="modal-header">
          <h2>Добавить тег к палитре</h2>
          <button class="modal-close" @click="closeAddTagModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Выберите тип тега:</label>
            <div class="tag-type-selector">
              <button 
                :class="['tag-type-btn', tagType === 'harmony' ? 'active' : '']"
                @click="tagType = 'harmony'"
              >
                Тип гармонии
              </button>
              <button 
                :class="['tag-type-btn', tagType === 'mood' ? 'active' : '']"
                @click="tagType = 'mood'"
              >
                Настроение
              </button>
              <button 
                :class="['tag-type-btn', tagType === 'custom' ? 'active' : '']"
                @click="tagType = 'custom'"
              >
                Пользовательский
              </button>
            </div>
          </div>
          
          <div class="form-group" v-if="tagType === 'harmony'">
            <label>Тип гармонии:</label>
            <div class="tag-selector">
              <button 
                v-for="type in harmonyTypes"
                :key="type"
                :class="['tag-option', addingTagPalette?.tags?.includes(type) ? 'selected' : '']"
                @click="toggleTagOnPalette(type)"
              >
                {{ getRussianHarmony(type) }}
              </button>
            </div>
          </div>
          
          <div class="form-group" v-if="tagType === 'mood'">
            <label>Настроение:</label>
            <div class="tag-selector">
              <button 
                v-for="mood in moodTypes"
                :key="mood"
                :class="['tag-option', addingTagPalette?.tags?.includes(mood) ? 'selected' : '']"
                @click="toggleTagOnPalette(mood)"
              >
                {{ getRussianMood(mood) }}
              </button>
            </div>
          </div>
          
          <div class="form-group" v-if="tagType === 'custom'">
            <label>Пользовательский тег:</label>
            <div class="tags-input">
              <input 
                type="text" 
                v-model="newCustomTag"
                @keyup.enter="addNewCustomTag"
                class="tag-input"
                placeholder="Введите тег и нажмите Enter"
              >
              <div class="suggested-tags" v-if="suggestedTags.length > 0">
                <p>Часто используемые теги:</p>
                <div class="suggested-tags-list">
                  <button 
                    v-for="suggestedTag in suggestedTags"
                    :key="suggestedTag"
                    class="suggested-tag"
                    @click="addSuggestedTag(suggestedTag)"
                  >
                    {{ suggestedTag }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Текущие теги палитры:</label>
            <div class="current-tags">
              <span 
                v-for="tag in getDisplayTags(addingTagPalette || {})" 
                :key="tag" 
                class="current-tag"
              >
                {{ tag }}
              </span>
              <span 
                v-for="customTag in (addingTagPalette?.customTags || [])" 
                :key="`custom-${customTag}`" 
                class="current-tag custom"
              >
                {{ customTag }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeAddTagModal">
            Отмена
          </button>
          <button class="btn btn-save" @click="saveTags">
            Сохранить теги
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно удаления -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h2>Удаление палитры</h2>
        </div>
        
        <div class="modal-body">
          <p>Вы уверены, что хотите удалить палитру <strong>"{{ deletingPalette?.name }}"</strong>?</p>
          <p>Это действие нельзя отменить.</p>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeDeleteModal">
            Отмена
          </button>
          <button class="btn btn-danger" @click="confirmDelete">
            Удалить
          </button>
        </div>
      </div>
    </div>

    <!-- Уведомление -->
    <div v-if="showNotification" class="notification">
      <i class="fas fa-check-circle"></i> {{ notificationMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const showFilters = ref(false)
const palettes = ref([])
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showAddTagModal = ref(false)
const showNotification = ref(false)
const notificationMessage = ref('')
const searchTimeout = ref(null)
const tagType = ref('harmony')
const newCustomTag = ref('')

const harmonyTypes = ['analogous', 'monochromatic', 'triadic', 'complementary', 'tetradic']
const moodTypes = ['calm', 'energetic', 'professional', 'vibrant', 'pastel']

// Словари для перевода
const harmonyTranslations = {
  analogous: 'Аналогичная',
  monochromatic: 'Монохромная',
  triadic: 'Триада',
  complementary: 'Комплементарная',
  tetradic: 'Тетрадная'
}

const moodTranslations = {
  calm: 'Спокойные',
  energetic: 'Энергичные',
  professional: 'Профессиональные',
  vibrant: 'Яркие',
  pastel: 'Пастельные'
}

// Обратные словари для поиска оригинального тега
const reverseHarmonyTranslations = {
  'Аналогичная': 'analogous',
  'Монохромная': 'monochromatic',
  'Триада': 'triadic',
  'Комплементарная': 'complementary',
  'Тетрадная': 'tetradic'
}

const reverseMoodTranslations = {
  'Спокойные': 'calm',
  'Энергичные': 'energetic',
  'Профессиональные': 'professional',
  'Яркие': 'vibrant',
  'Пастельные': 'pastel'
}

const selectedFilters = ref({
  harmony: [],
  mood: [],
  date: ''
})

// Редактируемая палитра
const editingPalette = ref({
  id: null,
  name: '',
  colors: [],
  tags: [],
  customTags: [],
  createdAt: ''
})

// Палитра для удаления
const deletingPalette = ref(null)

// Палитра для добавления тегов
const addingTagPalette = ref(null)

// Новый тег
const newTag = ref('')

// Часто используемые теги из всех палитр
const suggestedTags = computed(() => {
  const allTags = {}
  palettes.value.forEach(palette => {
    if (palette.customTags) {
      palette.customTags.forEach(tag => {
        if (tag && tag.trim()) {
          allTags[tag] = (allTags[tag] || 0) + 1
        }
      })
    }
  })
  
  // Возвращаем топ-5 самых популярных тегов
  return Object.entries(allTags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag)
})

const filteredPalettes = computed(() => {
  if (!palettes.value.length) return []
  
  return palettes.value.filter(palette => {
    const allTags = getAllTags(palette)
    
    // 🔍 Поиск по названию
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase().trim()
      if (!query) return true
      
      const nameMatch = palette.name.toLowerCase().includes(query)
      if (nameMatch) return true
      
      // ✅ ИСПРАВЛЕННЫЙ поиск по ТЕГАМ (русским + английским)
      const tagMatch = allTags.some(tag => {
        const tagLower = tag.toLowerCase()
        const queryLower = query.toLowerCase()
        
        // Точное совпадение
        if (tagLower === queryLower) return true
        
        // Частичное совпадение
        if (tagLower.includes(queryLower) || queryLower.includes(tagLower)) return true
        
        // 🔑 Русские переводы гармонии
        if (harmonyTranslations[tag]) {
          const russian = harmonyTranslations[tag].toLowerCase()
          if (russian.includes(queryLower) || queryLower.includes(russian)) return true
        }
        
        // 🔑 Русские переводы настроения
        if (moodTranslations[tag]) {
          const russian = moodTranslations[tag].toLowerCase()
          if (russian.includes(queryLower) || queryLower.includes(russian)) return true
        }
        
        return false
      })
      
      if (!tagMatch) return false
    }
    
    // Фильтры (исправлены - проверяем allTags)
    if (selectedFilters.value.harmony.length > 0) {
      const hasHarmony = selectedFilters.value.harmony.some(type => 
        palette.tags?.includes(type) || allTags.includes(type)
      )
      if (!hasHarmony) return false
    }
    
    if (selectedFilters.value.mood.length > 0) {
      const hasMood = selectedFilters.value.mood.some(mood => 
        palette.tags?.includes(mood) || allTags.includes(mood)
      )
      if (!hasMood) return false
    }
    
    // Фильтр по дате (без изменений)
    if (selectedFilters.value.date) {
      const paletteDate = new Date(palette.createdAt)
      const now = new Date()
      switch (selectedFilters.value.date) {
        case 'today': return paletteDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return paletteDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return paletteDate >= monthAgo
      }
    }
    
    return true
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})


onMounted(() => {
  loadPalettes()
})

// Перевод типов гармонии
function getRussianHarmony(english) {
  return harmonyTranslations[english] || english
}

// Перевод настроений
function getRussianMood(english) {
  return moodTranslations[english] || english
}

// Получение оригинального тега по русскому названию
function getOriginalTag(palette, russianTag) {
  // Проверяем гармонии
  if (reverseHarmonyTranslations[russianTag]) {
    return reverseHarmonyTranslations[russianTag]
  }
  
  // Проверяем настроения
  if (reverseMoodTranslations[russianTag]) {
    return reverseMoodTranslations[russianTag]
  }
  
  // Если не нашли в словарях, это пользовательский тег
  // Ищем соответствующий оригинальный тег в палитре
  const allTags = getAllTags(palette)
  const tag = allTags.find(t => {
    if (harmonyTranslations[t] === russianTag) return t
    if (moodTranslations[t] === russianTag) return t
    return t === russianTag
  })
  
  return tag || russianTag
}

// Поиск по тегу при клике на тег на карточке
function searchByTag(tag) {
  searchQuery.value = tag
  showFilters.value = true
}

// Обработка поиска с debounce
function handleSearch() {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    // Фильтрация происходит автоматически через computed свойство
    console.log('Поиск выполнен:', searchQuery.value)
    console.log('Ищет по: оригинальным названиям тегов (например: "analogous", "calm")')
  }, 300)
}

// Функция для получения всех тегов палитры (для поиска) - только оригинальные значения
function getAllTags(palette) {
  const tags = []
  
  // Добавляем стандартные теги
  if (palette.tags && Array.isArray(palette.tags)) {
    tags.push(...palette.tags)
  }
  
  // Добавляем пользовательские теги
  if (palette.customTags && Array.isArray(palette.customTags)) {
    tags.push(...palette.customTags)
  }
  
  // Добавляем тип гармонии если есть
  if (palette.harmonyType && !tags.includes(palette.harmonyType)) {
    tags.push(palette.harmonyType)
  }
  
  // Добавляем настроение если есть
  if (palette.moodType && !tags.includes(palette.moodType)) {
    tags.push(palette.moodType)
  }
  
  // Удаляем дубликаты и пустые теги
  return [...new Set(tags.filter(tag => tag && tag.trim()))]
}

// Функция для получения тегов для отображения (русские названия)
function getDisplayTags(palette) {
  if (!palette || !palette.tags) return []
  
  const tags = [...(palette.tags || [])]
  return tags.map(tag => {
    // Пробуем перевести гармонию
    if (harmonyTranslations[tag]) {
      return harmonyTranslations[tag]
    }
    // Пробуем перевести настроение
    if (moodTranslations[tag]) {
      return moodTranslations[tag]
    }
    // Оставляем как есть (если тег уже на русском или пользовательский)
    return tag
  })
}

// Функция для получения заголовка тега
function getTagTitle(tag) {
  const tagTitles = {
    'analogous': 'Аналогичная гармония',
    'monochromatic': 'Монохромная гармония',
    'triadic': 'Триада',
    'complementary': 'Комплементарная гармония',
    'tetradic': 'Тетрадная гармония',
    'calm': 'Спокойное настроение',
    'energetic': 'Энергичное настроение',
    'professional': 'Профессиональное настроение',
    'vibrant': 'Яркое настроение',
    'pastel': 'Пастельное настроение'
  }
  
  return tagTitles[tag] || tag
}

function loadPalettes() {
  try {
    const saved = localStorage.getItem('paletteLibrary')
    palettes.value = saved ? JSON.parse(saved) : []
    
    // Нормализация данных
    let needsUpdate = false
    palettes.value.forEach(palette => {
      // Гарантируем наличие всех полей
      palette.tags = palette.tags || []
      palette.customTags = palette.customTags || []
      palette.harmonyType = palette.harmonyType || null
      palette.moodType = palette.moodType || null
      
      // Удаляем пустые теги и дубликаты
      const originalTagsLength = palette.tags.length
      palette.tags = [...new Set(palette.tags.filter(tag => tag && tag.trim()))]
      if (originalTagsLength !== palette.tags.length) needsUpdate = true
      
      const originalCustomTagsLength = palette.customTags.length
      palette.customTags = [...new Set(palette.customTags.filter(tag => tag && tag.trim()))]
      if (originalCustomTagsLength !== palette.customTags.length) needsUpdate = true
      
      // Если есть отдельные поля harmonyType/moodType, добавляем их в tags
      if (palette.harmonyType && !palette.tags.includes(palette.harmonyType)) {
        palette.tags.push(palette.harmonyType)
        needsUpdate = true
      }
      
      if (palette.moodType && !palette.tags.includes(palette.moodType)) {
        palette.tags.push(palette.moodType)
        needsUpdate = true
      }
      
      // Убедимся, что colors есть и это массив
      if (!palette.colors || !Array.isArray(palette.colors)) {
        palette.colors = []
        needsUpdate = true
      }
    })
    
    if (needsUpdate) {
      localStorage.setItem('paletteLibrary', JSON.stringify(palettes.value))
      console.log('Данные нормализованы и сохранены')
    }
  } catch (error) {
    console.error('Ошибка загрузки палитр:', error)
    palettes.value = []
  }
}

function toggleHarmonyFilter(type) {
  const index = selectedFilters.value.harmony.indexOf(type)
  if (index === -1) {
    selectedFilters.value.harmony.push(type)
  } else {
    selectedFilters.value.harmony.splice(index, 1)
  }
}

function toggleMoodFilter(mood) {
  const index = selectedFilters.value.mood.indexOf(mood)
  if (index === -1) {
    selectedFilters.value.mood.push(mood)
  } else {
    selectedFilters.value.mood.splice(index, 1)
  }
}

function openEditModal(palette) {
  editingPalette.value = {
    id: palette.id,
    name: palette.name,
    colors: JSON.parse(JSON.stringify(palette.colors || [])),
    tags: [...(palette.tags || [])],
    customTags: [...(palette.customTags || [])],
    createdAt: palette.createdAt
  }
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingPalette.value = {
    id: null,
    name: '',
    colors: [],
    tags: [],
    customTags: [],
    createdAt: ''
  }
  newTag.value = ''
}

function openAddTagModal(palette) {
  addingTagPalette.value = JSON.parse(JSON.stringify(palette))
  tagType.value = 'harmony'
  newCustomTag.value = ''
  showAddTagModal.value = true
}

function closeAddTagModal() {
  showAddTagModal.value = false
  addingTagPalette.value = null
  newCustomTag.value = ''
}

function openDeleteModal(palette) {
  deletingPalette.value = palette
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deletingPalette.value = null
}

function showNotificationMessage(message) {
  notificationMessage.value = message
  showNotification.value = true
  
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

function updateColor(index, value) {
  if (value && value.startsWith('#')) {
    editingPalette.value.colors[index].hex = value.toUpperCase()
  }
}

function removeColor(index) {
  if (editingPalette.value.colors.length > 3) {
    editingPalette.value.colors.splice(index, 1)
  }
}

function addColor() {
  const newColor = {
    hex: '#FFFFFF',
    rgb: 'rgb(255, 255, 255)',
    locked: false
  }
  editingPalette.value.colors.push(newColor)
}

function toggleTag(tag) {
  const index = editingPalette.value.tags.indexOf(tag)
  if (index === -1) {
    editingPalette.value.tags.push(tag)
  } else {
    editingPalette.value.tags.splice(index, 1)
  }
}

function toggleTagOnPalette(tag) {
  if (!addingTagPalette.value) return
  
  const index = addingTagPalette.value.tags.indexOf(tag)
  if (index === -1) {
    // Добавляем тег, если его нет
    addingTagPalette.value.tags.push(tag)
  } else {
    // Удаляем тег, если он уже есть
    addingTagPalette.value.tags.splice(index, 1)
  }
}

function addCustomTag() {
  if (newTag.value.trim() && !editingPalette.value.customTags.includes(newTag.value.trim())) {
    editingPalette.value.customTags.push(newTag.value.trim())
    newTag.value = ''
  }
}

function addNewCustomTag() {
  if (newCustomTag.value.trim() && addingTagPalette.value) {
    if (!addingTagPalette.value.customTags) {
      addingTagPalette.value.customTags = []
    }
    
    if (!addingTagPalette.value.customTags.includes(newCustomTag.value.trim())) {
      addingTagPalette.value.customTags.push(newCustomTag.value.trim())
      newCustomTag.value = ''
    }
  }
}

function addSuggestedTag(tag) {
  if (addingTagPalette.value) {
    if (!addingTagPalette.value.customTags) {
      addingTagPalette.value.customTags = []
    }
    
    if (!addingTagPalette.value.customTags.includes(tag)) {
      addingTagPalette.value.customTags.push(tag)
    }
  }
}

function removeCustomTag(index) {
  editingPalette.value.customTags.splice(index, 1)
}

// Удаление пользовательского тега с карточки
function removeCustomTagFromPalette(palette, tagToRemove) {
  const index = palettes.value.findIndex(p => p.id === palette.id)
  if (index !== -1) {
    const tagIndex = palettes.value[index].customTags.indexOf(tagToRemove)
    if (tagIndex !== -1) {
      palettes.value[index].customTags.splice(tagIndex, 1)
      localStorage.setItem('paletteLibrary', JSON.stringify(palettes.value))
      showNotificationMessage(`Тег "${tagToRemove}" удален`)
    }
  }
}

function saveEditedPalette() {
  const index = palettes.value.findIndex(p => p.id === editingPalette.value.id)
  if (index !== -1) {
    // Обновляем палитру
    palettes.value[index] = {
      ...palettes.value[index],
      name: editingPalette.value.name,
      colors: editingPalette.value.colors,
      tags: editingPalette.value.tags.filter(tag => 
        harmonyTypes.includes(tag) || moodTypes.includes(tag)
      ),
      customTags: editingPalette.value.customTags,
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem('paletteLibrary', JSON.stringify(palettes.value))
    showNotificationMessage('Палитра успешно обновлена')
    closeEditModal()
  }
}

function saveTags() {
  const index = palettes.value.findIndex(p => p.id === addingTagPalette.value.id)
  if (index !== -1) {
    palettes.value[index].tags = [...new Set(addingTagPalette.value.tags.filter(tag => tag && tag.trim()))]
    palettes.value[index].customTags = [...new Set(addingTagPalette.value.customTags.filter(tag => tag && tag.trim()))]
    palettes.value[index].updatedAt = new Date().toISOString()
    
    localStorage.setItem('paletteLibrary', JSON.stringify(palettes.value))
    showNotificationMessage('Теги обновлены')
    closeAddTagModal()
  }
}

function confirmDelete() {
  if (deletingPalette.value) {
    palettes.value = palettes.value.filter(p => p.id !== deletingPalette.value.id)
    localStorage.setItem('paletteLibrary', JSON.stringify(palettes.value))
    showNotificationMessage('Палитра удалена')
    closeDeleteModal()
  }
}

function toggleFavorite(id) {
  const palette = palettes.value.find(p => p.id === id)
  if (palette) {
    palette.favorite = !palette.favorite
    localStorage.setItem('paletteLibrary', JSON.stringify(palettes.value))
    showNotificationMessage(palette.favorite ? 'Добавлено в избранное' : 'Удалено из избранного')
  }
}

function loadPalette(palette) {
  localStorage.setItem('currentPalette', JSON.stringify(palette.colors))
  localStorage.setItem('baseColor', palette.baseColor || '#4a6fa5')
  
  // Определяем тип гармонии и настроение из тегов
  const harmonyType = palette.tags?.find(t => harmonyTypes.includes(t)) || 'analogous'
  const moodType = palette.tags?.find(t => moodTypes.includes(t)) || 'calm'
  
  localStorage.setItem('harmonyType', harmonyType)
  localStorage.setItem('moodType', moodType)
  
  showNotificationMessage(`Палитра "${palette.name}" загружена`)
  
  // Переходим на главную с небольшой задержкой
  setTimeout(() => {
    router.push('/')
  }, 500)
}

function exportPalette(palette) {
  // Сохраняем выбранную палитру в localStorage
  localStorage.setItem('exportPalette', JSON.stringify(palette))
  
  // Переходим на страницу экспорта
  router.push('/export')
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return 'Сегодня'
  } else if (diffDays === 1) {
    return 'Вчера'
  } else if (diffDays < 7) {
    return `${diffDays} дней назад`
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
}
</script>

<style scoped>
.library-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.library-header {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.library-header h1 {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  color: #2c3e50;
}

.search-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #4a6fa5;
  box-shadow: 0 0 0 2px rgba(74, 111, 165, 0.1);
}

.filter-btn {
  padding: 12px 25px;
  background: #6b9ac4;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.filter-btn:hover {
  background: #4a6fa5;
}

.filters-panel {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-group {
  margin-bottom: 15px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-btn {
  padding: 6px 12px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.tag-btn:hover {
  border-color: #6b9ac4;
}

.tag-btn.active {
  background: #4a6fa5;
  color: white;
  border-color: #4a6fa5;
}

.palettes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.palette-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.palette-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.palette-header {
  padding: 20px 20px 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.palette-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.palette-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f8f9fa;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.icon-btn:hover {
  background: #e9ecef;
}

.palette-colors {
  display: flex;
  height: 80px;
}

.library-color {
  flex: 1;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 10px;
  transition: flex 0.2s;
  cursor: pointer;
}

.library-color:hover {
  flex: 1.2;
  z-index: 1;
}

.color-hex {
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0.8;
  transition: opacity 0.2s;
}

.library-color:hover .color-hex {
  opacity: 1;
}

.palette-info {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-top: 1px solid #f0f0f0;
  flex-direction: column;
  gap: 10px;
}

.palette-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.tag {
  padding: 4px 10px;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 0.75rem;
  color: #666;
  transition: all 0.2s;
}

.clickable-tag {
  cursor: pointer;
  border: 1px solid transparent;
}

.clickable-tag:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
  border-color: #4a6fa5;
}

.custom-tag {
  background: #e0f7fa;
  color: #006064;
  display: flex;
  align-items: center;
  gap: 4px;
  padding-right: 4px;
}

.tag-remove-btn {
  background: none;
  border: none;
  color: #006064;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.6rem;
  opacity: 0.6;
  transition: all 0.2s;
}

.tag-remove-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

.add-tag-btn {
  background: #e8f5e8;
  color: #2e7d32;
  cursor: pointer;
  border: 1px dashed #4caf50;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
}

.add-tag-btn:hover {
  background: #c8e6c9;
  border-color: #2e7d32;
}

.palette-date {
  font-size: 0.75rem;
  color: #999;
  align-self: flex-end;
}

.palette-footer {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  background: #f8f9fa;
}

.load-btn, .export-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.3s;
}

.load-btn {
  background: #4a6fa5;
  color: white;
}

.load-btn:hover {
  background: #3a5a8c;
}

.export-btn {
  background: #6b9ac4;
  color: white;
}

.export-btn:hover {
  background: #5a8ab4;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
  background: white;
  border-radius: 12px;
  margin-top: 30px;
}

.empty-state i {
  margin-bottom: 20px;
  color: #ddd;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.create-btn {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 30px;
  background: #4a6fa5;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
}

.create-btn:hover {
  background: #3a5a8c;
}

/* Модальные окна и уведомления */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: modalAppear 0.3s ease;
}

.tag-modal {
  max-width: 500px;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.delete-modal {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  transition: color 0.3s;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 30px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 30px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

/* Стили для модального окна тегов */
.tag-type-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tag-type-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.tag-type-btn:hover {
  border-color: #6b9ac4;
}

.tag-type-btn.active {
  background: #4a6fa5;
  color: white;
  border-color: #4a6fa5;
}

.suggested-tags {
  margin-top: 15px;
}

.suggested-tags p {
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #666;
}

.suggested-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggested-tag {
  padding: 6px 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.suggested-tag:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

.current-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.current-tag {
  padding: 4px 10px;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #666;
}

.current-tag.custom {
  background: #e0f7fa;
  color: #006064;
}

/* Формы в модальном окне */
.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #2c3e50;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #4a6fa5;
  box-shadow: 0 0 0 2px rgba(74, 111, 165, 0.1);
}

.edit-colors {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 15px;
}

.edit-color-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.color-preview {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  flex-shrink: 0;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
}

.color-hex-input {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  transition: border-color 0.3s;
}

.color-hex-input:focus {
  outline: none;
  border-color: #4a6fa5;
}

.color-remove {
  background: #e74c3c;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.3s;
}

.color-remove:hover {
  background: #c0392b;
}

.btn-add-color {
  background: #4a6fa5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s;
}

.btn-add-color:hover {
  background: #3a5a8c;
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-option {
  padding: 8px 16px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.tag-option:hover {
  border-color: #6b9ac4;
}

.tag-option.selected {
  background: #4a6fa5;
  color: white;
  border-color: #4a6fa5;
}

.tags-input {
  margin-top: 10px;
}

.tag-input {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: border-color 0.3s;
}

.tag-input:focus {
  outline: none;
  border-color: #4a6fa5;
}

.custom-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.custom-tag {
  background: #e0f7fa;
  color: #006064;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.tag-remove {
  background: none;
  border: none;
  color: #006064;
  cursor: pointer;
  padding: 0;
  font-size: 0.8rem;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.tag-remove:hover {
  opacity: 1;
}

/* Кнопки */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-cancel {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-cancel:hover {
  background: #bdc3c7;
}

.btn-save {
  background: #4a6fa5;
  color: white;
}

.btn-save:hover {
  background: #3a5a8c;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

/* Уведомление */
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #2ecc71;
  color: white;
  padding: 15px 25px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1001;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.library-stats {
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  color: #666;
}

.library-stats p {
  margin: 0;
}

.library-stats strong {
  color: #4a6fa5;
}

@media (max-width: 768px) {
  .palettes-grid {
    grid-template-columns: 1fr;
  }
  
  .search-controls {
    flex-direction: column;
  }
  
  .modal-content {
    margin: 10px;
  }
  
  .edit-color-item {
    flex-wrap: wrap;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .palette-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .palette-actions {
    align-self: flex-end;
  }
  
  .tag-type-selector {
    flex-direction: column;
  }
}
</style>