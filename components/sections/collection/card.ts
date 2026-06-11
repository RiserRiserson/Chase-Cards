export type CardItem = {
  id: string

  // Identity
  full_card_name?: string
  year?: number
  brand?: string
  player?: string
  card_number?: string
  set?: string
  subset_parallel?: string
  sport?: string

  // Attributes
  rookie?: boolean
  autograph?: boolean
  memorabilia?: boolean
  game_used?: boolean
  serial_numbered?: boolean
  serial_number?: string

  // Condition
  condition_purchased?: string
  current_condition?: string
  grading_company?: string

  // Purchase
  purchase_date?: string
  purchase_from?: string
  purchase_price?: number

  // Value
  estimated_value_cad?: number
  value_date?: string

  // Sales
  card_sold?: boolean
  sales_date?: string
  sales_platform?: string
  sales_amount?: number
  fees?: number

  // Media
  image_url?: string
}