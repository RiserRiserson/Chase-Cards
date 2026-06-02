import { supabase } from './supabaseClient'
import type { TradingCard } from './card-data'

export async function getCards(): Promise<TradingCard[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }

  return (data ?? []) as TradingCard[]
}