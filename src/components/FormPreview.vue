<script setup lang="ts">
import { computed, ref } from 'vue'

type TableColumn = {
  id: string
  label: string
  type: string
}

type QuestionConfig = {
  id: number
  question: string
  targetColumnId: string | null // id réel de colonne
}

const props = defineProps<{
  columns: TableColumn[]
  questions: QuestionConfig[]
}>()

const emit = defineEmits<{
  (e: 'submit', payload: Record<string, string>): void
}>()

const answers = ref<Record<number, string>>({})

const rowPayload = computed<Record<string, string>>(() => {
  const payload: Record<string, string> = {}
  props.questions.forEach((q) => {
    if (q.targetColumnId) {
      payload[q.targetColumnId] = answers.value[q.id] ?? ''
    }
  })
  return payload
})

function handleSubmit() {
  emit('submit', rowPayload.value)
}
</script>

<template>
  <div class="preview-root">
    <h2 class="preview-title">Aperçu du formulaire généré</h2>

    <p class="preview-help">
      Chaque question alimente directement une colonne réelle de la table source.
    </p>

    <form class="preview-form" @submit.prevent="handleSubmit">
      <div v-for="q in questions" :key="q.id" class="preview-field">
        <label class="preview-label" :for="`answer-q-${q.id}`">
          {{ q.question || `Question ${q.id}` }}
          <span v-if="q.targetColumnId" class="preview-tag">
            →
            {{ columns.find((c) => c.id === q.targetColumnId)?.label || q.targetColumnId }}
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
      <h3 class="preview-subtitle">Payload envoyé (colonne → valeur)</h3>
      <pre class="preview-json">{{ rowPayload }}</pre>
    </div>
  </div>
</template>

<style scoped>
/* même CSS que ta version précédente */
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
