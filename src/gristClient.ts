// src/gristClient.ts

export type QuestionConfig = {
  id: number
  question: string
  targetColumnId: number | null
}

export type WidgetOptions = {
  columnCount: number
  questions: QuestionConfig[]
  externalUrl?: string | null
}

export type FormRow = {
  id: number
}

// API Grist typée minimalement
type GristDocApi = {
  create: (tableId: string, records: Array<{ fields: Record<string, unknown> }>) => Promise<unknown>
}

type GristTableInfo = {
  tableId: string
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

const TABLE_ID_DEFAULT = 'Table1'

let gristApi: GristApi | undefined
let currentTableId: string | null = null
let currentOptions: WidgetOptions | null = null

const optionsListeners: Array<(options: WidgetOptions) => void> = []
const editOptionsListeners: Array<() => void> = []

// Initialisation de l’API Grist
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

  gristApi.onOptions((options: WidgetOptions | undefined) => {
    if (!options) {
      return
    }
    currentOptions = options
    optionsListeners.forEach((cb) => cb(options))
  })

  const tableInfo = gristApi.getTable()
  currentTableId = tableInfo ? tableInfo.tableId : null
}

// Abonnement aux options
export function onGristOptionsChange(cb: (options: WidgetOptions) => void): void {
  optionsListeners.push(cb)
  if (currentOptions) {
    cb(currentOptions)
  }
}

// Abonnement au clic sur “Ouvrir la configuration”
export function onEditGristOptions(cb: () => void): void {
  editOptionsListeners.push(cb)
}

// Lecture des options actuelles
export function getCurrentGristOptions(): WidgetOptions | null {
  return currentOptions
}

// Sauvegarde des options
export function setGristOptions(options: WidgetOptions): void {
  if (!gristApi || !gristApi.setOptions) {
    console.warn('setGristOptions appelé sans API Grist ou sans setOptions.')
    return
  }
  currentOptions = options
  gristApi.setOptions(options)
}

// Création d’une ligne dans la table Grist
export async function createRowFromPayload(
  payload: Record<string, string>,
  explicitTableId?: string,
): Promise<void> {
  if (!gristApi) {
    console.warn('createRowFromPayload appelé sans API Grist, payload =', payload)
    return
  }

  const targetTableId = explicitTableId || currentTableId || TABLE_ID_DEFAULT

  const fields: Record<string, unknown> = {}
  for (const [colName, value] of Object.entries(payload)) {
    fields[colName] = value
  }

  try {
    await gristApi.docApi.create(targetTableId, [{ fields }])
  } catch (error) {
    console.error('Erreur lors de la création de la ligne dans Grist :', error)
    throw error
  }
}
