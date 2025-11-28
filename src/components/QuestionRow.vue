<script setup lang="ts">
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
  question: QuestionConfig
  columns: TableColumn[]
}>()

const emit = defineEmits<{
  (e: 'update:question', value: QuestionConfig): void
}>()

function onQuestionInput(newText: string) {
  emit('update:question', {
    ...props.question,
    question: newText,
  })
}

function onTargetColumnChange(newTargetId: string) {
  emit('update:question', {
    ...props.question,
    targetColumnId: newTargetId || null,
  })
}
</script>

<template>
  <div class="question-row">
    <div class="question-header">
      <span class="question-index">Question {{ question.id }}</span>
    </div>

    <div class="question-field">
      <label class="config-label config-label--sm" :for="`question-text-${question.id}`">
        Intitulé de la question
      </label>
      <input
        :id="`question-text-${question.id}`"
        type="text"
        class="config-input"
        :value="question.question"
        @input="onQuestionInput(($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="question-field">
      <label class="config-label config-label--sm" :for="`question-target-${question.id}`">
        Colonne à alimenter (table source)
      </label>
      <select
        :id="`question-target-${question.id}`"
        class="config-select"
        :value="question.targetColumnId ?? ''"
        @change="onTargetColumnChange(($event.target as HTMLSelectElement).value)"
      >
        <option value="">— Sélectionner une colonne —</option>
        <option v-for="col in columns" :key="col.id" :value="col.id">
          {{ col.label }} ({{ col.id }})
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
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
</style>
