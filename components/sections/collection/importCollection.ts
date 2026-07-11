import * as XLSX from 'xlsx'
import type { CardItem } from './card'
import { CARD_SPREADSHEET_COLUMNS } from './card-spreadsheet-columns'

export type ImportedCard = Omit<
  CardItem,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>

export type ImportResult = {
  cards: ImportedCard[]
  errors: string[]
}

function parseBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'boolean') {
    return value
  }

  const normalized = String(value).trim().toLowerCase()

  if (['yes', 'true', '1', 'y'].includes(normalized)) {
    return true
  }

  if (['no', 'false', '0', 'n'].includes(normalized)) {
    return false
  }

  return null
}

function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

function parseDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }

  const text = String(value).trim()

  const parsed = new Date(text)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toISOString().slice(0, 10)
}

function parseText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null
  }

  const text = String(value).trim()

  return text === '' ? null : text
}

export async function importCollectionFile(
  file: File
): Promise<ImportResult> {
  const buffer = await file.arrayBuffer()

  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true
  })

  const firstSheetName = workbook.SheetNames[0]

  if (!firstSheetName) {
    return {
      cards: [],
      errors: ['The workbook does not contain any worksheets.']
    }
  }

  const worksheet = workbook.Sheets[firstSheetName]

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    worksheet,
    {
      defval: null,
      raw: false
    }
  )

  const expectedHeaders = CARD_SPREADSHEET_COLUMNS
    .filter(column => column.importable)
    .map(column => column.header)

  const actualHeaders =
    rows.length > 0
      ? Object.keys(rows[0])
      : []

  const missingHeaders = expectedHeaders.filter(
    header => !actualHeaders.includes(header)
  )

  if (missingHeaders.length > 0) {
    return {
      cards: [],
      errors: [
        `Missing required spreadsheet columns: ${missingHeaders.join(', ')}`
      ]
    }
  }

  const cards: ImportedCard[] = []
  const errors: string[] = []

  rows.forEach((row, index) => {
    const card: Partial<ImportedCard> = {}

    for (const column of CARD_SPREADSHEET_COLUMNS) {
      if (!column.importable) continue

      const rawValue = row[column.header]

      switch (column.type) {
        case 'boolean': {
          const parsed = parseBoolean(rawValue)

          if (
            rawValue !== null &&
            rawValue !== '' &&
            parsed === null
          ) {
            errors.push(
              `Row ${index + 2}: "${column.header}" must be Yes or No.`
            )
          }

          ;(card as Record<string, unknown>)[column.key] =
            parsed ?? false

          break
        }

        case 'number':
        case 'currency': {
          const parsed = parseNumber(rawValue)

          if (
            rawValue !== null &&
            rawValue !== '' &&
            parsed === null
          ) {
            errors.push(
              `Row ${index + 2}: "${column.header}" must be a valid number.`
            )
          }

          ;(card as Record<string, unknown>)[column.key] = parsed
          break
        }

        case 'date': {
          const parsed = parseDate(rawValue)

          if (
            rawValue !== null &&
            rawValue !== '' &&
            parsed === null
          ) {
            errors.push(
              `Row ${index + 2}: "${column.header}" must be a valid date.`
            )
          }

          ;(card as Record<string, unknown>)[column.key] = parsed
          break
        }

        default:
          ;(card as Record<string, unknown>)[column.key] =
            parseText(rawValue)
      }
    }

    const hasAnyValue = Object.values(card).some(
      value =>
        value !== null &&
        value !== undefined &&
        value !== '' &&
        value !== false
    )

    if (hasAnyValue) {
      cards.push(card as ImportedCard)
    }
  })

  return {
    cards,
    errors
  }
}