import { createApp } from 'vue'
import App from './App.vue'
import { initGrist } from './gristClient'

// Initialisation de l’API Grist (si présente)
initGrist()

createApp(App).mount('#app')
