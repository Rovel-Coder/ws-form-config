<script setup lang="ts">
import { computed } from 'vue'
import QuestionRow from './QuestionRow.vue'

type TableColumn = {
  id: string
  label: string
  type: string
}

type QuestionConfig = {
  id: number
  question: string
  targetColumnId: string | null
}

const props = defineProps<{
  columnCount: number
  columns: TableColumn[]
  questions: QuestionConfig[]
}>()

const emit = defineEmits<{
  (e: 'update:column-count', value: number): void
  (e: 'update:question', value: QuestionConfig): void
}>()

const localColumnCount = computed({
  get: () => props.columnCount,
  set: (value: number | string) => {
    const numeric = typeof value === 'string' ? parseInt(value, 10) || 0 : value
    emit('update:column-count', numeric)
  },
})

function onQuestionUpdate(updated: QuestionConfig) {
  emit('update:question', updated)
}
</script>

<template>
  <div class="config-root">
    <h2 class="config-title">Panneau de configuration</h2>

    <div class="config-block">
      <label class="config-label" for="column-count">Nombre de questions</label>
      <input
        id="column-count"
        v-model="localColumnCount"
        type="number"
        min="1"
        class="config-input"
      />
      <p class="config-help">
        Ce nombre détermine combien de questions seront affichées dans le formulaire.
      </p>
    </div>

    <div class="config-block">
      <h3 class="config-subtitle">Questions et colonnes associées</h3>
      <p class="config-help">
        Pour chaque question, saisissez l’intitulé et choisissez la colonne de la table source
        qu’elle alimente. Toutes les colonnes de la table sont disponibles.
      </p>

      <QuestionRow
        v-for="q in questions"
        :key="q.id"
        :question="q"
        :columns="columns"
        @update:question="onQuestionUpdate"
      />
    </div>
  </div>
</template>

<style scoped>
.config-root {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.config-title {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
  font-weight: 600;
}
.config-subtitle {
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
}
.config-block {
  border-radius: 0.5rem;
  border: 1px solid #d0d0e0;
  padding: 0.75rem 0.9rem;
  background-color: #fafbff;
}
.config-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.config-input {
  width: 100%;
  box-sizing: border-box;
  border-radius: 0.35rem;
  border: 1px solid #c0c4d0;
  padding: 0.3rem 0.45rem;
  font-size: 0.85rem;
}
.config-help {
  margin: 0.3rem 0 0;
  font-size: 0.75rem;
  color: #666;
}
</style>
