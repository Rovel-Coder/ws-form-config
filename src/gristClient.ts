// src/gristClient.ts

// Types minimaux pour éviter les erreurs TypeScript
type GristDocApi = {
  create: (tableId: string, records: Array<{ fields: Record<string, unknown> }>) => Promise<unknown>
}

type GristOptions = {
  columnCount: number
  questions: Array<{
    id: number
    question: string
    targetColumnId: number | null
  }>
}

type GristApi = {
  ready: (options?: {
    requiredAccess?: 'full' | 'read table' | 'none'
    onEditOptions?: () => void
  }) => void
  onOptions: (cb: (options: GristOptions | undefined) => void) => void
  setOptions?: (options: GristOptions) => void
  docApi: GristDocApi
}

declare global {
  interface Window {
    grist?: GristApi
  }
}

const TABLE_ID_DEFAULT = 'Table1' // à adapter au nom réel de ta table dans Grist

// Stockage interne simple pour les options et l’API
let gristApi: GristApi | undefined
let currentOptions: GristOptions | null = null
const optionsListeners: Array<(options: GristOptions) => void> = []
const editOptionsListeners: Array<() => void> = []

export function initGrist() {
  if (typeof window === 'undefined') {
    return
  }

  if (!window.grist) {
    // Pas dans un iframe Grist : mode “standalone”
    console.warn('Grist API non détectée, fonctionnement en mode standalone.')
    return
  }

  gristApi = window.grist

  // Déclaration avec gestion du panneau de config Grist
  gristApi.ready({
    requiredAccess: 'full',
    onEditOptions: () => {
      editOptionsListeners.forEach((cb) => cb())
    },
  })

  // Écoute des changements d’options (panneau de configuration Grist)
  gristApi.onOptions((options: GristOptions | undefined) => {
    if (!options) {
      return
    }
    currentOptions = options
    optionsListeners.forEach((cb) => cb(options))
  })
}

// Permet à l’UI de s’abonner aux options widget
export function onGristOptionsChange(cb: (options: GristOptions) => void) {
  optionsListeners.push(cb)
  if (currentOptions != null) {
    cb(currentOptions)
  }
}

// Permet à l’UI d’être notifiée quand on ouvre “Modifier les options” dans Grist
export function onEditGristOptions(cb: () => void) {
  editOptionsListeners.push(cb)
}

// Sauvegarder les options côté Grist
export function setGristOptions(options: GristOptions) {
  if (!gristApi || !gristApi.setOptions) {
    console.warn('setGristOptions appelé sans API Grist ou setOptions indisponible.')
    return
  }
  currentOptions = options
  gristApi.setOptions(options)
}

// Récupérer les options actuelles
export function getCurrentGristOptions(): GristOptions | null {
  return currentOptions
}

// Création d’une ligne dans la table Grist à partir d’un payload { Colonne X: valeur }
export async function createRowFromPayload(
  payload: Record<string, string>,
  tableId = TABLE_ID_DEFAULT,
) {
  if (!gristApi) {
    console.warn('createRowFromPayload appelé sans API Grist, payload =', payload)
    return
  }

  const fields: Record<string, unknown> = {}

  // Ici, les clés du payload doivent correspondre aux noms de colonnes de la table cible
  Object.entries(payload).forEach(([colName, value]) => {
    fields[colName] = value
  })

  try {
    await gristApi.docApi.create(tableId, [{ fields }])
  } catch (err) {
    console.error('Erreur lors de la création de la ligne dans Grist :', err)
    throw err
  }
}
