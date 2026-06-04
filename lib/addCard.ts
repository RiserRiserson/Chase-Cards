import { supabase } from './supabaseClient'

export async function addCard(card: any) {
  // Get current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("USER FETCH ERROR:", userError)
    return { data: null, error: userError || new Error("No authenticated user") }
  }

  const payload = {
    name: card.name,
    game: card.game,
    set: card.set,
    year: card.year,
    condition: card.condition,
    market_value: card.marketValue,
    purchase_price: card.purchasePrice,
    quantity: card.quantity,
    rarity: card.rarity,
    image_url: card.imageUrl,
    user_id: user.id   // ✅ ALWAYS from auth, not input
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