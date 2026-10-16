export type RequestCondition = 'new' | 'used' | 'any'
export type RequestStatus = 'open' | 'accepted' | 'closed'
export type ResponseStatus = 'pending' | 'accepted' | 'declined'

export type MarketRequest = {
  id: string
  title: string
  description: string
  category: string
  budgetMin: number
  budgetMax: number
  quantity: number
  location: string
  neededBy: string
  condition: RequestCondition
  image?: string
  buyerId: string
  buyerName: string
  postedHoursAgo: number
  status: RequestStatus
  views: number
}

export type SellerResponse = {
  id: string
  requestId: string
  sellerId: string
  price: number
  deliveryDays: number
  note: string
  productId?: string
  postedHoursAgo: number
  status: ResponseStatus
}

export const ME = 'me'

export const conditionLabels: Record<RequestCondition, string> = {
  new: 'Brand new',
  used: 'Used / Fairly used',
  any: 'New or used',
}

export const seedRequests: MarketRequest[] = [
  {
    id: 'r1001',
    title: '3.5kVA petrol generator for home use',
    description:
      'Looking for a reliable 3.5kVA petrol generator with key start, for a 3-bedroom flat. Should power fridge, TV, fans and lights. Prefer Elepaq, Sumec Firman or similar. Must come with warranty.',
    category: 'home',
    budgetMin: 280000,
    budgetMax: 380000,
    quantity: 1,
    location: 'Ikeja, Lagos',
    neededBy: '2026-10-30',
    condition: 'new',
    image: '/images/req-generator.png',
    buyerId: ME,
    buyerName: 'You',
    postedHoursAgo: 5,
    status: 'open',
    views: 142,
  },
  {
    id: 'r1002',
    title: '20 yards of emerald aso-ebi lace for wedding',
    description:
      'Need emerald green beaded lace with gold accents for a December wedding. 20 yards in total, same dye lot. Please share close-up photos of the fabric in your offer.',
    category: 'fashion',
    budgetMin: 150000,
    budgetMax: 240000,
    quantity: 20,
    location: 'Ibadan, Oyo',
    neededBy: '2026-11-20',
    condition: 'new',
    image: '/images/req-lace.png',
    buyerId: 'u_bisi',
    buyerName: 'Bisi A.',
    postedHoursAgo: 11,
    status: 'open',
    views: 318,
  },
  {
    id: 'r1003',
    title: '12 ergonomic office chairs for new office',
    description:
      'Setting up a co-working space in Wuse 2. Need 12 mesh ergonomic chairs with lumbar support and adjustable arms. Delivery and assembly in Abuja required. Invoice needed for company records.',
    category: 'home',
    budgetMin: 900000,
    budgetMax: 1500000,
    quantity: 12,
    location: 'Wuse 2, Abuja',
    neededBy: '2026-11-05',
    condition: 'new',
    image: '/images/req-office-chairs.png',
    buyerId: 'u_kola',
    buyerName: 'Kola Ventures',
    postedHoursAgo: 26,
    status: 'open',
    views: 207,
  },
  {
    id: 'r1004',
    title: 'Fairly used iPhone 14 Pro, 256GB',
    description:
      'UK-used or Nigerian-used iPhone 14 Pro, battery health above 85%, no Face ID issues. Deep purple or space black preferred. Willing to meet at a safe location or pay via escrow.',
    category: 'phones',
    budgetMin: 650000,
    budgetMax: 780000,
    quantity: 1,
    location: 'Port Harcourt, Rivers',
    neededBy: '2026-10-25',
    condition: 'used',
    image: '/images/p-phone.png',
    buyerId: 'u_ebi',
    buyerName: 'Ebiere T.',
    postedHoursAgo: 3,
    status: 'open',
    views: 96,
  },
  {
    id: 'r1005',
    title: 'Laptop for a university student (coding + design)',
    description:
      'My son is starting Computer Science. Need a laptop with at least 16GB RAM, 512GB SSD and good battery life. Brand new or open-box is fine.',
    category: 'computers',
    budgetMin: 550000,
    budgetMax: 850000,
    quantity: 1,
    location: 'Enugu, Enugu',
    neededBy: '2026-11-01',
    condition: 'any',
    image: '/images/p-laptop.png',
    buyerId: 'u_ngozi',
    buyerName: 'Ngozi E.',
    postedHoursAgo: 40,
    status: 'open',
    views: 254,
  },
  {
    id: 'r1006',
    title: 'Monthly foodstuff bundle for a family of 5',
    description:
      'Rice (50kg), beans, garri, palm oil, groundnut oil, tomatoes and pepper delivered on the first weekend of every month. Looking for a consistent supplier.',
    category: 'grocery',
    budgetMin: 120000,
    budgetMax: 170000,
    quantity: 1,
    location: 'Lekki, Lagos',
    neededBy: '2026-11-02',
    condition: 'new',
    image: '/images/cat-grocery.png',
    buyerId: 'u_dayo',
    buyerName: 'Dayo O.',
    postedHoursAgo: 52,
    status: 'accepted',
    views: 401,
  },
  {
    id: 'r1007',
    title: 'Dash cam with night vision for Toyota Camry',
    description: 'Front and rear dash cam with good night vision, loop recording and parking mode. Installation in Lagos is a plus.',
    category: 'automotive',
    budgetMin: 45000,
    budgetMax: 90000,
    quantity: 1,
    location: 'Surulere, Lagos',
    neededBy: '2026-10-28',
    condition: 'new',
    image: '/images/p-dashcam.png',
    buyerId: 'u_femi',
    buyerName: 'Femi K.',
    postedHoursAgo: 8,
    status: 'open',
    views: 73,
  },
]

export const seedResponses: SellerResponse[] = [
  {
    id: 'o1',
    requestId: 'r1001',
    sellerId: 's3',
    price: 345000,
    deliveryDays: 2,
    note: 'Sumec Firman SPG3800E2, key start, 1-year warranty. Free delivery within Ikeja and we help you set it up on arrival.',
    postedHoursAgo: 4,
    status: 'pending',
  },
  {
    id: 'o2',
    requestId: 'r1001',
    sellerId: 's5',
    price: 318000,
    deliveryDays: 3,
    note: 'Elepaq EC5800CX 3.5kVA, brand new in carton with 6-month warranty. Can deliver Thursday.',
    postedHoursAgo: 3,
    status: 'pending',
  },
  {
    id: 'o3',
    requestId: 'r1001',
    sellerId: 's1',
    price: 372000,
    deliveryDays: 1,
    note: 'Honda-engine 3.5kVA with remote start and changeover installation included. Same-day delivery available in Lagos mainland.',
    postedHoursAgo: 1,
    status: 'pending',
  },
  {
    id: 'o4',
    requestId: 'r1002',
    sellerId: 's2',
    price: 210000,
    deliveryDays: 4,
    note: 'We have this exact emerald beaded lace in stock — 20 yards from one dye lot. Can send a video of the fabric on request.',
    productId: 'p7',
    postedHoursAgo: 9,
    status: 'pending',
  },
  {
    id: 'o5',
    requestId: 'r1004',
    sellerId: 's1',
    price: 735000,
    deliveryDays: 2,
    note: 'UK-used iPhone 14 Pro 256GB, deep purple, battery health 91%. 3-month warranty and escrow protected.',
    productId: 'p1',
    postedHoursAgo: 2,
    status: 'pending',
  },
  {
    id: 'o6',
    requestId: 'r1005',
    sellerId: 's1',
    price: 780000,
    deliveryDays: 3,
    note: 'Voyager 14 with 16GB RAM / 512GB SSD, 12-hour battery. Comes with a free laptop bag.',
    productId: 'p5',
    postedHoursAgo: 30,
    status: 'pending',
  },
  {
    id: 'o7',
    requestId: 'r1007',
    sellerId: 's5',
    price: 68000,
    deliveryDays: 2,
    note: 'RoadEye dual dash cam with Sony night sensor. Free installation at our Surulere workshop.',
    productId: 'p17',
    postedHoursAgo: 6,
    status: 'pending',
  },
  {
    id: 'o8',
    requestId: 'r1006',
    sellerId: 's3',
    price: 158000,
    deliveryDays: 1,
    note: 'Full family bundle every first Saturday, fresh from Mile 12.',
    productId: 'p14',
    postedHoursAgo: 48,
    status: 'accepted',
  },
]

export function timeAgo(hours: number) {
  if (hours < 1) return 'just now'
  if (hours < 24) return `${Math.round(hours)}h ago`
  const d = Math.round(hours / 24)
  return `${d} day${d > 1 ? 's' : ''} ago`
}
