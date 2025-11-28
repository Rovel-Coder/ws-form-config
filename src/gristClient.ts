// src/gristClient.ts

// Représentation d'une ligne (si tu veux exploiter les données plus tard)
export type FormRow = {
  id: number
  // Ajoute ici les champs dont tu as besoin
}

// Configuration des mappings de colonnes (panneau de droite dans Grist)
export const columnsConfig = [
  { name: 'col1', title: 'Colonne 1', type: 'Any', optional: false },
  { name: 'col2', title: 'Colonne 2', type: 'Any', optional: false },
  { name: 'col3', title: 'Colonne 3', type: 'Any', optional: false },
  // Ajoute d’autres colonnes si besoin
]

type ColumnMapping = {
  columns?: Record<string, unknown>
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
  }) => void
  onRecords: (cb: (records: Record<string, unknown>[], mappings: ColumnMapping) => void) => void
  mapColumnNames: (
    records: Record<string, unknown>[],
    options: { columns: typeof columnsConfig; mappings: ColumnMapping },
  ) => Record<string, unknown>[] | null
  getTable: () => GristTableInfo | null
  docApi: GristDocApi
}

declare global {
  interface Window {
    grist?: GristApi
  }
}

const TABLE_ID_DEFAULT = 'Table1' // à adapter au nom de ta table

let gristApi: GristApi | undefined
let currentTableId: string | null = null

// Initialisation Grist (comme pour le Gantt)
export function initGrist(onRowsChange?: (rows: FormRow[]) => void): void {
  if (typeof window === 'undefined' || !window.grist) {
    console.warn('Grist API non détectée, mode standalone.')
    return
  }

  gristApi = window.grist

  gristApi.ready({
    requiredAccess: 'full',
    columns: columnsConfig,
  })

  if (!onRowsChange) {
    return
  }

  gristApi.onRecords((records: Record<string, unknown>[], mappings: ColumnMapping): void => {
    const mapped = gristApi!.mapColumnNames(records, {
      columns: columnsConfig,
      mappings,
    })

    if (!mapped) {
      onRowsChange([])
      currentTableId = null
      return
    }

    const tableInfo = gristApi!.getTable()
    currentTableId = tableInfo ? tableInfo.tableId : null

    const rows: FormRow[] = mapped.map((r) => ({
      id: Number(r.id),
    }))

    onRowsChange(rows)
  })
}

// Création d’une ligne dans la table Grist à partir d’un payload { Colonne X: valeur }
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
