// Fast Track content (rulebook page 6): pink "Dream" spaces you buy to win, and
// green "Business Investment" spaces that add to your CASHFLOW Day income.

export interface Dream {
  id: string
  label: string
  cost: number
  description: string
}

export interface FastTrackBusiness {
  id: string
  label: string
  downPayment: number
  /** Monthly cash flow added to your CASHFLOW Day income when purchased. */
  cashFlow: number
  description: string
}

export const DREAMS: Dream[] = [
  { id: 'dream_island', label: 'Private Island', cost: 250000, description: 'A tropical island to call your own.' },
  { id: 'dream_world_tour', label: 'Sail Around the World', cost: 150000, description: 'A year at sea, port to port.' },
  { id: 'dream_orphanage', label: 'Build an Orphanage', cost: 100000, description: 'Give children a home and a future.' },
  { id: 'dream_everest', label: 'Climb Mt. Everest', cost: 120000, description: 'Stand on top of the world.' },
  { id: 'dream_jet', label: 'Private Jet', cost: 200000, description: 'Fly anywhere, anytime, on your schedule.' },
  { id: 'dream_beach_house', label: 'Beach House', cost: 175000, description: 'Wake up to the ocean every morning.' },
  { id: 'dream_space', label: 'Trip to Space', cost: 230000, description: 'See the curve of the Earth for yourself.' },
  { id: 'dream_foundation', label: 'Start a Foundation', cost: 100000, description: 'Fund the causes you believe in.' },
]

export const FAST_TRACK_BUSINESSES: FastTrackBusiness[] = [
  { id: 'biz_oil', label: 'Oil Wells', downPayment: 50000, cashFlow: 16000, description: 'A stake in producing oil wells.' },
  { id: 'biz_restaurants', label: 'Restaurant Chain', downPayment: 150000, cashFlow: 40000, description: 'A regional chain of franchises.' },
  { id: 'biz_apartments', label: '300-Unit Apartments', downPayment: 100000, cashFlow: 30000, description: 'A large, professionally managed complex.' },
  { id: 'biz_software', label: 'Software Company', downPayment: 250000, cashFlow: 80000, description: 'A SaaS business with recurring revenue.' },
  { id: 'biz_hotel', label: 'Hotel Resort', downPayment: 300000, cashFlow: 75000, description: 'A destination resort property.' },
  { id: 'biz_mall', label: 'Shopping Mall', downPayment: 400000, cashFlow: 100000, description: 'Anchor tenants on long leases.' },
  { id: 'biz_tv', label: 'TV Station', downPayment: 500000, cashFlow: 120000, description: 'A regional broadcast station.' },
  { id: 'biz_team', label: 'Pro Sports Team', downPayment: 1000000, cashFlow: 250000, description: 'Own the home team.' },
]
