// src/gristClient.ts

export type TableColumn = {
  id: string // id interne (ex: "Titre")
  label: string // label affiché dans Grist
  type: string // type Grist (Text, Int, Date, ...)
}

export type QuestionConfig = {
  id: number
  question: string
  targetColumnId: string | null // id de la vraie colonne Grist
}

export type WidgetOptions = {
  columnCount: number
  questions: QuestionConfig[]
  externalUrl?: string | null
}

type GristTableInfo = {
  tableId: string
}

type GristDocApi = {
  // Méthode non documentée officiellement mais disponible dans la Plugin API interne :
  // on l’utilise pour récupérer colonnes + lignes de la table liée au widget.
  fetchTable: (tableId: string) => Promise<{
    id: string
    name: string
    columns: Array<{ id: string; label: string; type: string }>
    records: unknown[]
  }>
  create: (tableId: string, records: Array<{ fields: Record<string, unknown> }>) => Promise<unknown>
}

type GristApi = {
  ready: (options?: {
    requiredAccess?: 'full' | 'read table' | 'none'
    onEditOptions?: () => void
  }) => void
  onOptions: (cb: (options: WidgetOptions | undefined) => void) => void
  setOptions?: (options: WidgetOptions) => void
  getTable: () => GristTableInfo | null
  docApi: GristDocApi
}

declare global {
  interface Window {
    grist?: GristApi
  }
}

const TABLE_ID_FALLBACK = 'Table1'

let gristApi: GristApi | undefined
let currentTableId: string | null = null
let currentOptions: WidgetOptions | null = null
let currentColumns: TableColumn[] = []

const optionsListeners: Array<(options: WidgetOptions) => void> = []
const editOptionsListeners: Array<() => void> = []
const columnsListeners: Array<(columns: TableColumn[]) => void> = []

// --- Init Grist : options + tableId + colonnes réelles ---
export function initGrist(): void {
  if (typeof window === 'undefined' || !window.grist) {
    console.warn('Grist API non détectée, mode standalone.')
    return
  }

  gristApi = window.grist

  gristApi.ready({
    requiredAccess: 'full',
    onEditOptions: () => {
      editOptionsListeners.forEach((cb) => cb())
    },
  })

  const tableInfo = gristApi.getTable()
  currentTableId = tableInfo ? tableInfo.tableId : null

  if (currentTableId) {
    loadTableColumns(currentTableId).catch((err) => {
      console.error('Erreur lors du chargement des colonnes de la table :', err)
    })
  }

  gristApi.onOptions((options: WidgetOptions | undefined) => {
    if (!options) return
    currentOptions = options
    optionsListeners.forEach((cb) => cb(options))
  })
}

async function loadTableColumns(tableId: string): Promise<void> {
  if (!gristApi) return
  try {
    const table = await gristApi.docApi.fetchTable(tableId)
    currentColumns = table.columns.map((c) => ({
      id: c.id,
      label: c.label,
      type: c.type,
    }))
    columnsListeners.forEach((cb) => cb(currentColumns))
  } catch (error) {
    console.error('Impossible de récupérer les colonnes de la table :', error)
  }
}

// --- Options ---
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

// --- Colonnes réelles ---
export function onGristColumnsChange(cb: (columns: TableColumn[]) => void): void {
  columnsListeners.push(cb)
  if (currentColumns.length > 0) cb(currentColumns)
}

export function getCurrentGristColumns(): TableColumn[] {
  return currentColumns
}

// --- Création d’une ligne dans la table source ---
// payload : clés = id réels des colonnes Grist (ex: "Titre", "Debut")
export async function createRowFromPayload(
  payload: Record<string, string>,
  explicitTableId?: string,
): Promise<void> {
  if (!gristApi) {
    console.warn('createRowFromPayload sans API Grist, payload =', payload)
    return
  }

  const targetTableId = explicitTableId || currentTableId || TABLE_ID_FALLBACK

  const fields: Record<string, unknown> = {}
  for (const [colId, value] of Object.entries(payload)) {
    fields[colId] = value
  }

  try {
    await gristApi.docApi.create(targetTableId, [{ fields }])
  } catch (error) {
    console.error('Erreur lors de la création de la ligne dans Grist :', error)
    throw error
  }
}
