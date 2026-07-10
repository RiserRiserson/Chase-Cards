import type { CardItem } from './card'

export type SpreadsheetColumnType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'currency'

export type CardSpreadsheetColumn = {
  key: keyof CardItem
  header: string
  type: SpreadsheetColumnType
  importable: boolean
  exportable: boolean
}

export const CARD_SPREADSHEET_COLUMNS: CardSpreadsheetColumn[] = [
  {
    key: 'full_card_name',
    header: 'Full Card Name',
    type: 'text',
    importable: true,
    exportable: true
  },
  {
    key: 'year',
    header: 'Year',
    type: 'number',
    importable: true,
    exportable: true
  },
  {
    key: 'brand',
    header: 'Brand',
    type: 'text',
    importable: true,
    exportable: true
  },
  {
    key: 'player',
    header: 'Player',
    type: 'text',
    importable: true,
    exportable: true
  },
  {
    key: 'card_number',
    header: 'Card Number',
    type: 'text',
    importable: true,
    exportable: true
  },
  {
    key: 'set',
    header: 'Set',
    type: 'text',
    importable: true,
    exportable: true
  },
  {
    key: 'subset_parallel',
    header: 'Subset / Insert / Parallel',
    type: 'text',
    importable: true,
    exportable: true
  },
  {
    key: 'sport',
    header: 'Sport',
    type: 'text',
    importable: true,
    exportable: true
  },
  {
    key: 'rookie',
    header: 'Rookie',
    type: 'boolean',
    importable: true,
    exportable: true
  },
  {
    key: 'serial_numbered',
    header: 'Serial Numbered',
    type: 'boolean',
    importable: true,
    exportable: true
  },
  {
    key: 'serial_number',
    header: 'Serial Number',
    type: 'text',
    importable: true,
    exportable: true
  },
  {
    key: 'memorabilia',
    header: 'Memorabilia',
    type: 'boolean',
    importable: true,
    exportable: true
  },
  {
    key: 'game_used',
    header: 'Game Used',
    type: 'boolean',
    importable: true,
    exportable: true
  },
  {
    key: 'autograph',
    header: 'Autograph',
    type: 'boolean',
    importable: true,
    exportable: true
  },
  {
    key: 'condition_purchased',
    header: 'Condition When Purchased',
    type: 'text',
    importable: true,
    exportable: true
  },
  {
    key: 'current_condition',
    header: 'Current Condition',
    type: 'text',
    importable: true,
    exportable: true
  },
  {
    key: 'grading_company',
    header: 'Grading Company',
    type: 'text',
    importable: true,
    exportable: true
  },
  {
    key: 'purchase_date',
    header: 'Purchase Date',
    type: 'date',
    importable: true,
    exportable: true
  },
  {
    key: 'purchase_from',
    header: 'Purchased From',
    type: 'text',
    importable: true,
    exportable: true
  },
  {
    key: 'purchase_price',
    header: 'Purchase Price',
    type: 'currency',
    importable: true,
    exportable: true
  },
  {
    key: 'estimated_value_cad',
    header: 'Estimated Value (CAD)',
    type: 'currency',
    importable: true,
    exportable: true
  },
  {
    key: 'value_date',
    header: 'Value Date',
    type: 'date',
    importable: true,
    exportable: true
  },
  {
    key: 'card_sold',
    header: 'Card Sold',
    type: 'boolean',
    importable: true,
    exportable: true
  },
  {
    key: 'sales_date',
    header: 'Sales Date',
    type: 'date',
    importable: true,
    exportable: true
  },
  {
    key: 'sales_platform',
    header: 'Sales Platform',
    type: 'text',
    importable: true,
    exportable: true
  },
  {
    key: 'sales_amount',
    header: 'Sales Amount',
    type: 'currency',
    importable: true,
    exportable: true
  },
  {
    key: 'fees',
    header: 'Fees',
    type: 'currency',
    importable: true,
    exportable: true
  },
  {
    key: 'image_url',
    header: 'Image URL',
    type: 'text',
    importable: true,
    exportable: true
  }
]