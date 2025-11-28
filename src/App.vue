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

// Mode configuration ou mode formulaire final
const isConfigMode = ref<boolean>(true)

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

// Validation de la configuration -> passage en mode formulaire
function validateConfiguration() {
  isConfigMode.value = false
}

// Réouverture de la configuration depuis le formulaire (optionnel)
function reopenConfiguration() {
  isConfigMode.value = true
}
</script>

<template>
  <div class="app-root">
    <header class="app-header">
      <h1 class="app-title">
        Formulaire personnalisé
        <span v-if="isConfigMode">– Mode configuration</span>
      </h1>
      <p class="app-subtitle" v-if="isConfigMode">
        À droite&nbsp;: configuration des questions et colonnes. À gauche&nbsp;: aperçu du
        formulaire généré.
      </p>
      <p class="app-subtitle" v-else>
        Formulaire prêt à l’emploi. Les réponses seront envoyées directement dans la table Grist.
      </p>
    </header>

    <main class="app-main" v-if="isConfigMode">
      <!-- Mode configuration : aperçu + panneau de config -->
      <section class="app-panel app-panel--preview">
        <FormPreview :columns="columns" :questions="questions" />
      </section>

      <aside class="app-panel app-panel--config">
        <ConfigPanel
          :column-count="columnCount"
          :columns="columns"
          :questions="questions"
          @update:column-count="handleUpdateColumnCount"
          @update:question="handleUpdateQuestion"
        />

        <div class="config-actions">
          <button type="button" class="config-button-primary" @click="validateConfiguration">
            Valider la configuration et utiliser le formulaire
          </button>
        </div>
      </aside>
    </main>

    <main class="app-main app-main--form" v-else>
      <!-- Mode formulaire final : le formulaire prend toute la largeur -->
      <section class="app-panel app-panel--preview app-panel--full">
        <FormPreview :columns="columns" :questions="questions" />

        <div class="config-actions config-actions--inline">
          <button type="button" class="config-button-secondary" @click="reopenConfiguration">
            Modifier la configuration
          </button>
        </div>
      </section>
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

.app-main--form {
  grid-template-columns: minmax(0, 1fr);
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
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.app-panel--full {
  min-height: 0;
}

.config-actions {
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
}

.config-actions--inline {
  justify-content: space-between;
  margin-top: 1rem;
}

.config-button-primary,
.config-button-secondary {
  padding: 0.4rem 0.9rem;
  border-radius: 0.4rem;
  font-size: 0.8rem;
  cursor: pointer;
}

.config-button-primary {
  border: 1px solid #0a76f6;
  background-color: #0a76f6;
  color: #fff;
}

.config-button-primary:hover {
  background-color: #075fcc;
  border-color: #075fcc;
}

.config-button-secondary {
  border: 1px solid #999;
  background-color: #f5f5f5;
  color: #333;
}

.config-button-secondary:hover {
  background-color: #e5e5e5;
}
</style>
