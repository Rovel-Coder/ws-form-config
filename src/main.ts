// src/main.ts
import { createApp, ref } from 'vue'
import type { Ref } from 'vue'
import App from './App.vue'
import { initGrist } from './gristClient'
import type { FormRow } from './gristClient'

// État partagé si tu veux exploiter des lignes venant de Grist (facultatif)
const formRows: Ref<FormRow[]> = ref([])

initGrist((rows) => {
  formRows.value = rows
})

const app = createApp(App)
app.provide('formRows', formRows)
app.mount('#app')
