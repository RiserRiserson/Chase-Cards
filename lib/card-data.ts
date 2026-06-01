export type CardGame = 'pokemon' | 'mtg' | 'sports'

export type CardCondition = 'mint' | 'near-mint' | 'excellent' | 'good' | 'fair' | 'poor'

export interface TradingCard {
  id: string
  name: string
  game: CardGame
  set: string
  year: number
  condition: CardCondition
  marketValue: number
  purchasePrice: number
  quantity: number
  rarity: string
  imageUrl: string
  priceHistory: { date: string; price: number }[]
}

export const sampleCards: TradingCard[] = [
  {
    id: '1',
    name: 'Charizard',
    game: 'pokemon',
    set: 'Base Set',
    year: 1999,
    condition: 'near-mint',
    marketValue: 420,
    purchasePrice: 280,
    quantity: 1,
    rarity: 'Holo Rare',
    imageUrl: '/cards/charizard.png',
    priceHistory: [
      { date: '2024-01', price: 350 },
      { date: '2024-02', price: 380 },
      { date: '2024-03', price: 390 },
      { date: '2024-04', price: 410 },
      { date: '2024-05', price: 420 },
    ],
  },
  {
    id: '2',
    name: 'Black Lotus',
    game: 'mtg',
    set: 'Alpha',
    year: 1993,
    condition: 'good',
    marketValue: 45000,
    purchasePrice: 32000,
    quantity: 1,
    rarity: 'Rare',
    imageUrl: '/cards/black-lotus.png',
    priceHistory: [
      { date: '2024-01', price: 38000 },
      { date: '2024-02', price: 40000 },
      { date: '2024-03', price: 42000 },
      { date: '2024-04', price: 44000 },
      { date: '2024-05', price: 45000 },
    ],
  },
  {
    id: '3',
    name: 'Pikachu Illustrator',
    game: 'pokemon',
    set: 'Promo',
    year: 1998,
    condition: 'excellent',
    marketValue: 5200,
    purchasePrice: 4800,
    quantity: 1,
    rarity: 'Ultra Rare',
    imageUrl: '/cards/pikachu-illustrator.png',
    priceHistory: [
      { date: '2024-01', price: 4900 },
      { date: '2024-02', price: 5000 },
      { date: '2024-03', price: 5100 },
      { date: '2024-04', price: 5150 },
      { date: '2024-05', price: 5200 },
    ],
  },
  {
    id: '4',
    name: 'Michael Jordan RC',
    game: 'sports',
    set: 'Fleer',
    year: 1986,
    condition: 'near-mint',
    marketValue: 12500,
    purchasePrice: 8900,
    quantity: 1,
    rarity: 'Rookie Card',
    imageUrl: '/cards/jordan-rc.png',
    priceHistory: [
      { date: '2024-01', price: 10000 },
      { date: '2024-02', price: 11000 },
      { date: '2024-03', price: 11500 },
      { date: '2024-04', price: 12000 },
      { date: '2024-05', price: 12500 },
    ],
  },
  {
    id: '5',
    name: 'Mewtwo',
    game: 'pokemon',
    set: 'Base Set',
    year: 1999,
    condition: 'mint',
    marketValue: 180,
    purchasePrice: 120,
    quantity: 2,
    rarity: 'Holo Rare',
    imageUrl: '/cards/mewtwo.png',
    priceHistory: [
      { date: '2024-01', price: 150 },
      { date: '2024-02', price: 160 },
      { date: '2024-03', price: 165 },
      { date: '2024-04', price: 175 },
      { date: '2024-05', price: 180 },
    ],
  },
  {
    id: '6',
    name: 'Mox Sapphire',
    game: 'mtg',
    set: 'Beta',
    year: 1993,
    condition: 'excellent',
    marketValue: 8500,
    purchasePrice: 6200,
    quantity: 1,
    rarity: 'Rare',
    imageUrl: '/cards/mox-sapphire.png',
    priceHistory: [
      { date: '2024-01', price: 7000 },
      { date: '2024-02', price: 7500 },
      { date: '2024-03', price: 7800 },
      { date: '2024-04', price: 8200 },
      { date: '2024-05', price: 8500 },
    ],
  },
]

export const conditionGrades: Record<CardCondition, { label: string; color: string; grade: string }> = {
  mint: { label: 'Mint', color: 'text-emerald-400', grade: 'PSA 10' },
  'near-mint': { label: 'Near Mint', color: 'text-green-400', grade: 'PSA 9' },
  excellent: { label: 'Excellent', color: 'text-primary', grade: 'PSA 8' },
  good: { label: 'Good', color: 'text-yellow-500', grade: 'PSA 7' },
  fair: { label: 'Fair', color: 'text-orange-400', grade: 'PSA 5-6' },
  poor: { label: 'Poor', color: 'text-destructive', grade: 'PSA 1-4' },
}

export const gameLabels: Record<CardGame, string> = {
  pokemon: 'Pokemon',
  mtg: 'Magic: The Gathering',
  sports: 'Sports Cards',
}
