import { supabase } from './supabaseClient'

export async function addCard(card: any) {
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
  }

  console.log("INSERT PAYLOAD:", payload)

  const { data, error } = await supabase
    .from('cards')
    .insert([payload])
    .select()   // IMPORTANT: must return inserted row

  console.log("INSERT RESULT DATA:", data)
  console.log("INSERT RESULT ERROR:", error)

  return { data, error }
}