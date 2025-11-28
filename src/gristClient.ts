// src/gristClient.ts

export type QuestionConfig = {
  id: number
  question: string
  targetColumnId: number | null // 1 = Colonne 1, etc.
}

export type WidgetOptions = {
  columnCount: number
  questions: QuestionConfig[]
  externalUrl?: string | null
}

// Colonnes logiques pour le mapping Grist (panneau de droite)
export const columnsConfig = [
  { name: 'col1', title: 'Colonne 1', type: 'Any', optional: false },
  { name: 'col2', title: 'Colonne 2', type: 'Any', optional: false },
  { name: 'col3', title: 'Colonne 3', type: 'Any', optional: false },
]

type ColumnMapping = {
  columns?: {
    col1?: string // vrai nom de colonne dans la table
    col2?: string
    col3?: string
  }
}

type GristTableInfo = {
  tableId: string
}

type GristDocApi = {
  create: (tableId: string, records: Array<{ fields: Record<string, unknown> }>) => Promise<unknown>
}

type GristApi = {
  ready: (options?: {
    requiredAccess?: 'full' | 'read table' | 'none'
    columns?: typeof columnsConfig
    onEditOptions?: () => void
  }) => void
  onOptions: (cb: (options: WidgetOptions | undefined) => void) => void
  setOptions?: (options: WidgetOptions) => void
  onRecords: (cb: (records: Record<string, unknown>[], mappings: ColumnMapping) => void) => void
  getTable: () => GristTableInfo | null
  docApi: GristDocApi
}

declare global {
  interface Window {
    grist?: GristApi
  }
}

const TABLE_ID_DEFAULT = 'Table1'

let gristApi: GristApi | undefined
let currentTableId: string | null = null
let currentMappings: ColumnMapping | null = null
let currentOptions: WidgetOptions | null = null

const optionsListeners: Array<(options: WidgetOptions) => void> = []
const editOptionsListeners: Array<() => void> = []

// --- Init Grist : mapping de colonnes + options + tableId ---
export function initGrist(): void {
  if (typeof window === 'undefined' || !window.grist) {
    console.warn('Grist API non détectée, mode standalone.')
    return
  }

  gristApi = window.grist

  gristApi.ready({
    requiredAccess: 'full',
    columns: columnsConfig, // → panneau Grist : Colonne 1/2/3
    onEditOptions: () => {
      editOptionsListeners.forEach((cb) => cb())
    },
  })

  // On écoute les records une fois pour récupérer tableId + mappings
  gristApi.onRecords((records, mappings) => {
    currentMappings = mappings
    const tableInfo = gristApi!.getTable()
    currentTableId = tableInfo ? tableInfo.tableId : null
  })

  // Options du widget (config interne)
  gristApi.onOptions((options: WidgetOptions | undefined) => {
    if (!options) return
    currentOptions = options
    optionsListeners.forEach((cb) => cb(options))
  })
}

// --- Gestion des options ---
export function onGristOptionsChange(cb: (options: WidgetOptions) => void): void {
  optionsListeners.push(cb)
  if (currentOptions) cb(currentOptions)
}

export function onEditGristOptions(cb: () => void): void {
  editOptionsListeners.push(cb)
}

export function getCurrentGristOptions(): WidgetOptions | null {
  return currentOptions
}

export function setGristOptions(options: WidgetOptions): void {
  if (!gristApi || !gristApi.setOptions) {
    console.warn('setGristOptions appelé sans API Grist ou sans setOptions.')
    return
  }
  currentOptions = options
  gristApi.setOptions(options)
}

// --- Utilitaires de mapping logique → vrai nom de colonne ---
function logicalKeyToConfigKey(logicalLabel: string): string | null {
  // "Colonne 1" → "col1"
  const match = /(\d+)$/.exec(logicalLabel.trim())
  if (!match) return null
  return `col${match[1]}`
}

function logicalToRealColumn(logicalLabel: string): string | null {
  if (!currentMappings || !currentMappings.columns) return null
  const cfgKey = logicalKeyToConfigKey(logicalLabel)
  if (!cfgKey) return null
  const cols = currentMappings.columns as Record<string, string | undefined>
  const real = cols[cfgKey]
  return real ?? null
}

// --- Création d’une ligne dans la table source ---
// logicalPayload : clés = "Colonne 1", "Colonne 2", etc. (ce que construit FormPreview)
export async function createRowFromPayload(
  logicalPayload: Record<string, string>,
  explicitTableId?: string,
): Promise<void> {
  if (!gristApi) {
    console.warn('createRowFromPayload sans API Grist, payload =', logicalPayload)
    return
  }

  const targetTableId = explicitTableId || currentTableId || TABLE_ID_DEFAULT

  const fields: Record<string, unknown> = {}
  for (const [logicalLabel, value] of Object.entries(logicalPayload)) {
    const realName = logicalToRealColumn(logicalLabel)
    if (realName) {
      fields[realName] = value
    } else {
      console.warn(`Aucun mapping trouvé pour ${logicalLabel}, valeur ignorée.`)
    }
  }

  try {
    await gristApi.docApi.create(targetTableId, [{ fields }])
  } catch (error) {
    console.error('Erreur lors de la création de la ligne dans Grist :', error)
    throw error
  }
}
