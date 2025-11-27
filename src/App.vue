<script setup lang="ts">
import { computed, ref } from 'vue'
import ConfigPanel from './components/ConfigPanel.vue'
import FormPreview from './components/FormPreview.vue'

type ColumnConfig = {
  id: number
  label: string
}

type QuestionConfig = {
  id: number
  question: string
  targetColumnId: number | null
}

// Nombre de colonnes configurées
const columnCount = ref<number>(3)

// Liste des colonnes dérivée du nombre
const columns = computed<ColumnConfig[]>(() => {
  const list: ColumnConfig[] = []
  for (let i = 1; i <= columnCount.value; i += 1) {
    list.push({
      id: i,
      label: `Colonne ${i}`,
    })
  }
  return list
})

// Liste des questions configurées
const questions = ref<QuestionConfig[]>([
  { id: 1, question: 'Question 1', targetColumnId: 1 },
  { id: 2, question: 'Question 2', targetColumnId: 2 },
  { id: 3, question: 'Question 3', targetColumnId: 3 },
])

// Met à jour le nombre de colonnes depuis le panneau de config
function handleUpdateColumnCount(newCount: number) {
  if (newCount < 1) {
    columnCount.value = 1
  } else {
    columnCount.value = newCount
  }

  // Ajuster la longueur du tableau de questions pour correspondre au nombre de colonnes
  if (questions.value.length < columnCount.value) {
    const currentLength = questions.value.length
    for (let i = currentLength + 1; i <= columnCount.value; i += 1) {
      questions.value.push({
        id: i,
        question: `Question ${i}`,
        targetColumnId: i <= columns.value.length ? i : null,
      })
    }
  } else if (questions.value.length > columnCount.value) {
    questions.value = questions.value.slice(0, columnCount.value)
  }
}

// Met à jour une question précise (texte ou colonne cible)
function handleUpdateQuestion(updated: QuestionConfig) {
  const index = questions.value.findIndex((q) => q.id === updated.id)
  if (index !== -1) {
    questions.value[index] = { ...updated }
  }
}
</script>

<template>
  <div class="app-root">
    <header class="app-header">
      <h1 class="app-title">Configuration du formulaire colonne par colonne</h1>
      <p class="app-subtitle">
        À droite&nbsp;: configuration des questions et colonnes. À gauche&nbsp;: aperçu du
        formulaire généré.
      </p>
    </header>

    <main class="app-main">
      <!-- Colonne gauche : aperçu du formulaire généré -->
      <section class="app-panel app-panel--preview">
        <FormPreview :columns="columns" :questions="questions" />
      </section>

      <!-- Colonne droite : panneau de configuration (type panneau de config Grist) -->
      <aside class="app-panel app-panel--config">
        <ConfigPanel
          :column-count="columnCount"
          :columns="columns"
          :questions="questions"
          @update:column-count="handleUpdateColumnCount"
          @update:question="handleUpdateQuestion"
        />
      </aside>
    </main>
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  background-color: #f5f5f7;
}

.app-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #d0d0e0;
  background-color: #ffffff;
}

.app-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.app-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #555;
}

.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1.4fr);
  gap: 1rem;
  padding: 1rem 1.5rem 1.5rem;
}

.app-panel {
  background-color: #ffffff;
  border-radius: 0.5rem;
  border: 1px solid #d0d0e0;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.app-panel--preview {
  overflow: auto;
}

.app-panel--config {
  overflow: auto;
}
</style>
