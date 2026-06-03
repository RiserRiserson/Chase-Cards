import { supabase } from './supabaseClient'

export async function addCard(card: any) {
  // Get current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    console.error("USER FETCH ERROR:", userError)
  }

  const payload = {
    name: card.name,
    game: card.game,
    set_name: card.set,
    year: card.year,
    condition: card.condition,
    marketvalue: card.marketValue,
    purchaseprice: card.purchasePrice,
    quantity: card.quantity,
    rarity: card.rarity,
    imageurl: card.imageUrl,

    // NEW: ownership field
    user_id: user?.id || null
  }

  console.log("INSERT PAYLOAD:", payload)

  const { data, error } = await supabase
    .from('cards')
    .insert([payload])
    .select()

  console.log("INSERT RESULT DATA:", data)
  console.log("INSERT RESULT ERROR:", error)

  return { data, error }
}