import * as XLSX from 'xlsx'
import type { CardItem } from './card'
import { CARD_SPREADSHEET_COLUMNS } from './card-spreadsheet-columns'

export function exportCollection(cards: CardItem[]) {
  const rows = cards.map(card => {
    const row: Record<string, unknown> = {}

    for (const column of CARD_SPREADSHEET_COLUMNS) {
      const value = card[column.key]

      switch (column.type) {
        case 'boolean':
          row[column.header] =
            value === true ? 'Yes' :
            value === false ? 'No' :
            ''
          break

        case 'currency':
        case 'number':
          row[column.header] = value ?? ''
          break

        case 'date':
          row[column.header] = value ?? ''
          break

        default:
          row[column.header] = value ?? ''
      }
    }

    return row
  })

  const worksheet = XLSX.utils.json_to_sheet(rows)

  worksheet['!autofilter'] = {
    ref: worksheet['!ref'] ?? 'A1'
  }

  worksheet['!cols'] = [
    { wch: 40 }, // Full Card Name
    { wch: 10 }, // Year
    { wch: 20 }, // Brand
    { wch: 28 }, // Player
    { wch: 15 }, // Card Number
    { wch: 25 }, // Set
    { wch: 25 }, // Parallel
    { wch: 15 }, // Sport
    { wch: 10 }, // Rookie
    { wch: 15 }, // Serial Numbered
    { wch: 18 }, // Serial Number
    { wch: 12 }, // Memorabilia
    { wch: 12 }, // Game Used
    { wch: 12 }, // Autograph
    { wch: 20 }, // Purchased Condition
    { wch: 20 }, // Current Condition
    { wch: 20 }, // Grading Company
    { wch: 15 }, // Purchase Date
    { wch: 25 }, // Purchased From
    { wch: 15 }, // Purchase Price
    { wch: 18 }, // Estimated Value
    { wch: 15 }, // Value Date
    { wch: 10 }, // Sold
    { wch: 15 }, // Sale Date
    { wch: 20 }, // Sales Platform
    { wch: 15 }, // Sales Amount
    { wch: 12 }, // Fees
    { wch: 40 }  // Image URL
  ]

  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Collection'
  )

  const today = new Date()

  const filename =
    `ChaseCards_Collection_${today.getFullYear()}-` +
    `${String(today.getMonth() + 1).padStart(2, '0')}-` +
    `${String(today.getDate()).padStart(2, '0')}.xlsx`

  XLSX.writeFile(workbook, filename)
}