import { createApp } from 'vue'
import App from './App.vue'
import { initGrist } from './gristClient'

initGrist() // plus de callback ici

const app = createApp(App)
app.mount('#app')
