<script setup lang="ts">
import { computed } from 'vue'

type ColumnConfig = {
  id: number
  label: string
}

type QuestionConfig = {
  id: number
  question: string
  targetColumnId: number | null
}

const props = defineProps<{
  columnCount: number
  columns: ColumnConfig[]
  questions: QuestionConfig[]
}>()

const emit = defineEmits<{
  (e: 'update:column-count', value: number): void
  (e: 'update:question', value: QuestionConfig): void
  (e: 'save'): void
}>()

const localColumnCount = computed({
  get: () => props.columnCount,
  set: (value: number | string) => {
    const numeric = typeof value === 'string' ? parseInt(value, 10) || 0 : value
    emit('update:column-count', numeric)
  },
})

function onQuestionInput(q: QuestionConfig, newText: string) {
  emit('update:question', {
    ...q,
    question: newText,
  })
}

function onTargetColumnChange(q: QuestionConfig, newTargetId: string) {
  const parsed = newTargetId ? parseInt(newTargetId, 10) : NaN
  emit('update:question', {
    ...q,
    targetColumnId: Number.isNaN(parsed) ? null : parsed,
  })
}

function onSaveClick() {
  emit('save')
}
</script>

<template>
  <div class="config-root">
    <h2 class="config-title">Panneau de configuration</h2>

    <div class="config-block">
      <label class="config-label" for="column-count"> Nombre de colonnes </label>
      <input
        id="column-count"
        v-model="localColumnCount"
        type="number"
        min="1"
        class="config-input"
      />
      <p class="config-help">
        Ce nombre détermine à la fois le nombre de colonnes de la table source et le nombre de
        questions à déclarer.
      </p>
    </div>

    <div class="config-block">
      <h3 class="config-subtitle">Questions et colonnes associées</h3>
      <p class="config-help">
        Pour chaque question, saisissez l’intitulé et choisissez la colonne de la table qu’elle
        alimente.
      </p>

      <div v-for="q in questions" :key="q.id" class="question-row">
        <div class="question-header">
          <span class="question-index"> Question {{ q.id }} </span>
        </div>

        <div class="question-field">
          <label class="config-label config-label--sm" :for="`question-text-${q.id}`">
            Intitulé de la question
          </label>
          <input
            :id="`question-text-${q.id}`"
            type="text"
            class="config-input"
            :value="q.question"
            @input="onQuestionInput(q, ($event.target as HTMLInputElement).value)"
          />
        </div>

        <div class="question-field">
          <label class="config-label config-label--sm" :for="`question-target-${q.id}`">
            Colonne à alimenter
          </label>
          <select
            :id="`question-target-${q.id}`"
            class="config-select"
            :value="q.targetColumnId ?? ''"
            @change="onTargetColumnChange(q, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">— Sélectionner une colonne —</option>
            <option v-for="col in columns" :key="col.id" :value="col.id">
              {{ col.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="config-actions">
      <button type="button" class="config-button" @click="onSaveClick">
        Enregistrer la configuration
      </button>
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

.config-label--sm {
  font-weight: 500;
}

.config-input,
.config-select {
  width: 100%;
  box-sizing: border-box;
  border-radius: 0.35rem;
  border: 1px solid #c0c4d0;
  padding: 0.3rem 0.45rem;
  font-size: 0.85rem;
}

.config-input:focus,
.config-select:focus {
  outline: 2px solid #0a76f6;
  outline-offset: 1px;
  border-color: #0a76f6;
}

.config-help {
  margin: 0.3rem 0 0;
  font-size: 0.75rem;
  color: #666;
}

.question-row {
  margin-top: 0.6rem;
  padding-top: 0.6rem;
  border-top: 1px dashed #d0d0e0;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
}

.question-index {
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
}

.question-field {
  margin-bottom: 0.5rem;
}

.config-actions {
  display: flex;
  justify-content: flex-end;
}

.config-button {
  padding: 0.4rem 0.9rem;
  border-radius: 0.4rem;
  border: 1px solid #0a76f6;
  background-color: #0a76f6;
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
}

.config-button:hover {
  background-color: #075fcc;
  border-color: #075fcc;
}
</style>
