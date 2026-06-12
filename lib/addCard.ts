import { supabase } from './supabaseClient'

export async function addCard(card: any) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('USER FETCH ERROR:', userError)
    return { data: null, error: userError || new Error('No authenticated user') }
  }

  const payload = {
    user_id: user.id,

    full_card_name: card.full_card_name ?? null,
    player: card.player ?? null,
    year: card.year ? Number(card.year) : null,
    brand: card.brand ?? null,
    card_number: card.card_number ?? null,
    set: card.set ?? null,
    subset_parallel: card.subset_parallel ?? null,
    sport: card.sport ?? null,

    rookie: card.rookie ?? false,
    autograph: card.autograph ?? false,
    memorabilia: card.memorabilia ?? false,
    game_used: card.game_used ?? false,
    serial_numbered: card.serial_numbered ?? false,
    serial_number: card.serial_number ?? null,

    condition_purchased: card.condition_purchased ?? null,
    current_condition: card.current_condition ?? null,
    grading_company: card.grading_company ?? null,

    purchase_date: card.purchase_date ?? null,
    purchase_from: card.purchase_from ?? null,
    purchase_price: card.purchase_price
      ? Number(card.purchase_price)
      : null,

    estimated_value_cad: card.estimated_value_cad
      ? Number(card.estimated_value_cad)
      : null,

    value_date: card.value_date ?? null,

    card_sold: false,
    sales_date: null,
    sales_platform: null,
    sales_amount: null,
    fees: null,

    image_url: card.image_url ?? ''
  }

  console.log('INSERT PAYLOAD:', payload)

  const { data, error } = await supabase
    .from('cards')
    .insert([payload])
    .select()

  console.log('INSERT RESULT DATA:', data)
  console.log('INSERT RESULT ERROR:', error)

  return { data, error }
}