// src/router.js
import { createRouter, createWebHistory } from 'vue-router'

import PaletteGenerator from './components/PaletteGenerator.vue'
import PaletteLibrary from './components/PaletteLibrary.vue'
import ColorAnalysis from './components/ColorAnalysis.vue'
import PaletteExport from './components/ExportTools.vue'

const routes = [
  {
    path: '/',
    name: 'Generator',
    component: PaletteGenerator
  },
  {
    path: '/library',
    name: 'Library',
    component: PaletteLibrary
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: ColorAnalysis
  },
  {
    path: '/export',
    name: 'Export',
    component: PaletteExport
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router