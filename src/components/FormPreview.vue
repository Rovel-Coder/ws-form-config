<script setup lang="ts">
import { computed, ref } from 'vue'
import { createRowFromPayload } from '../gristClient'

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
  columns: ColumnConfig[]
  questions: QuestionConfig[]
}>()

const answers = ref<Record<number, string>>({})

const rowPayload = computed<Record<string, string>>(() => {
  const payload: Record<string, string> = {}

  props.questions.forEach((q) => {
    if (q.targetColumnId != null) {
      const col = props.columns.find((c) => c.id === q.targetColumnId)
      if (col) {
        payload[col.label] = answers.value[q.id] ?? ''
      }
    }
  })

  return payload
})

async function handleSubmit() {
  try {
    await createRowFromPayload(rowPayload.value)
    alert('Ligne créée dans Grist (si le widget est ouvert dans un doc).')
  } catch {
    alert('Erreur lors de la création de la ligne dans Grist (voir console).')
  }
}
</script>

<template>
  <div class="preview-root">
    <h2 class="preview-title">Aperçu du formulaire généré</h2>

    <p class="preview-help">
      Ce formulaire est construit à partir des questions et de leur colonne cible. Chaque champ
      alimente une colonne de la table source.
    </p>

    <form class="preview-form" @submit.prevent="handleSubmit">
      <div v-for="q in questions" :key="q.id" class="preview-field">
        <label class="preview-label" :for="`answer-q-${q.id}`">
          {{ q.question || `Question ${q.id}` }}
          <span v-if="q.targetColumnId != null" class="preview-tag">
            → Col. {{ columns.find((c) => c.id === q.targetColumnId)?.label || q.targetColumnId }}
          </span>
          <span v-else class="preview-tag preview-tag--warning"> non liée à une colonne </span>
        </label>
        <input
          :id="`answer-q-${q.id}`"
          v-model="answers[q.id]"
          type="text"
          class="preview-input"
          placeholder="Saisir une réponse…"
        />
      </div>

      <button type="submit" class="preview-submit">Générer la ligne pour la table source</button>
    </form>

    <div class="preview-payload">
      <h3 class="preview-subtitle">Structure de la ligne générée</h3>
      <pre class="preview-json">{{ rowPayload }}</pre>
    </div>
  </div>
</template>

<style scoped>
.preview-root {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.preview-subtitle {
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.preview-help {
  margin: 0;
  font-size: 0.78rem;
  color: #666;
}

.preview-form {
  margin-top: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.preview-field {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.preview-label {
  font-size: 0.82rem;
  font-weight: 500;
}

.preview-tag {
  margin-left: 0.4rem;
  font-size: 0.7rem;
  padding: 0.05rem 0.35rem;
  border-radius: 999px;
  background-color: #e5f1ff;
  color: #1452a5;
}

.preview-tag--warning {
  background-color: #fff3cd;
  color: #8a6d3b;
}

.preview-input {
  width: 100%;
  box-sizing: border-box;
  border-radius: 0.35rem;
  border: 1px solid #c0c4d0;
  padding: 0.3rem 0.45rem;
  font-size: 0.85rem;
}

.preview-input:focus {
  outline: 2px solid #0a76f6;
  outline-offset: 1px;
  border-color: #0a76f6;
}

.preview-submit {
  align-self: flex-start;
  margin-top: 0.3rem;
  border: none;
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: #0a76f6;
  color: #fff;
  cursor: pointer;
}

.preview-submit:hover {
  background-color: #075ec4;
}

.preview-payload {
  margin-top: 0.7rem;
  border-radius: 0.5rem;
  border: 1px solid #d0d0e0;
  background-color: #f8fafc;
  padding: 0.6rem 0.7rem;
}

.preview-json {
  margin: 0;
  font-size: 0.75rem;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
