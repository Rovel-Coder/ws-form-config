// src/gristClient.ts

// Types minimaux pour éviter les erreurs TypeScript
type GristDocApi = {
  create: (tableId: string, records: Array<{ fields: Record<string, unknown> }>) => Promise<unknown>
}

type GristApi = {
  ready: (options?: unknown) => void
  onOptions: (cb: (options: unknown) => void) => void
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
let currentOptions: unknown | null = null
const optionsListeners: Array<(options: unknown) => void> = []

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

  // Déclaration minimale pour signaler que le widget est prêt
  gristApi.ready()

  // Écoute des changements d’options (panneau de configuration Grist)
  gristApi.onOptions((options: unknown) => {
    currentOptions = options
    optionsListeners.forEach((cb) => cb(options))
  })
}

// Permet à l’UI de s’abonner aux options widget (si tu veux les utiliser plus tard)
export function onGristOptionsChange(cb: (options: unknown) => void) {
  optionsListeners.push(cb)
  if (currentOptions != null) {
    cb(currentOptions)
  }
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
