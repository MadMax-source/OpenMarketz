export type Category = {
  slug: string
  name: string
  image: string
  description: string
}

export type Seller = {
  id: string
  slug: string
  name: string
  initials: string
  tagline: string
  about: string
  banner: string
  rating: number
  reviews: number
  followers: number
  location: string
  joined: string
  verified: boolean
  responseTime: string
  positiveRate: number
  phone?: string
}

export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  sellerId: string
  price: number
  compareAt?: number
  rating: number
  reviews: number
  sold: number
  stock: number
  image: string
  gallery: string[]
  badge?: 'Best seller' | 'New' | 'Limited'
  freeDelivery: boolean
  description: string
  highlights: string[]
  specs: { label: string; value: string }[]
  variants?: { name: string; options: string[] }[]
  video?: string
  features?: { title: string; description: string }[]
  negotiable?: boolean
  condition?: 'Brand new' | 'Foreign used' | 'Locally used'
  unitLabel?: string
}

type BaseProduct = Omit<Product, 'video' | 'features' | 'negotiable'>

export const categories: Category[] = [
  { slug: 'phones', name: 'Phones & Gadgets', image: '/images/cat-phones.png', description: 'Smartphones, audio, wearables and accessories from trusted tech sellers.' },
  { slug: 'fashion', name: 'Fashion', image: '/images/cat-fashion.png', description: 'Ankara, sneakers, bags and everyday style from local designers.' },
  { slug: 'home', name: 'Home & Kitchen', image: '/images/cat-home.png', description: 'Appliances, decor and essentials to make your space feel like home.' },
  { slug: 'beauty', name: 'Health & Beauty', image: '/images/cat-beauty.png', description: 'Skincare, haircare and wellness from authentic, verified brands.' },
  { slug: 'computers', name: 'Computing', image: '/images/cat-computers.png', description: 'Laptops, peripherals and work-from-anywhere gear.' },
  { slug: 'grocery', name: 'Groceries', image: '/images/cat-grocery.png', description: 'Fresh produce and pantry staples delivered to your door.' },
  { slug: 'sports', name: 'Sports & Fitness', image: '/images/cat-sports.png', description: 'Jerseys, training kits and equipment for every game.' },
  { slug: 'automotive', name: 'Automotive', image: '/images/cat-automotive.png', description: 'Car electronics, care products and spare parts.' },
]

export const sellers: Seller[] = [
  {
    id: 's1', slug: 'novatech-mobile', name: 'Novatech Mobile', initials: 'NM',
    tagline: 'Authentic phones & gadgets with 12-month warranty',
    about: 'Novatech Mobile has been supplying genuine smartphones, audio gear and accessories across Nigeria since 2017. Every device is sourced from authorised distributors and ships with a full manufacturer warranty.',
    banner: '/images/banner-tech.png', rating: 4.8, reviews: 3820, followers: 18400,
    location: 'Ikeja, Lagos', joined: '2019', verified: true, responseTime: 'within 1 hour', positiveRate: 98,
  },
  {
    id: 's2', slug: 'ankara-house', name: 'Ankara House', initials: 'AH',
    tagline: 'Handmade African prints, tailored in Lagos',
    about: 'Ankara House is a women-led studio crafting contemporary pieces from premium African wax prints. Each garment is cut and sewn by our in-house tailors in Surulere.',
    banner: '/images/banner-fashion.png', rating: 4.9, reviews: 1240, followers: 9600,
    location: 'Surulere, Lagos', joined: '2020', verified: true, responseTime: 'within 3 hours', positiveRate: 99,
  },
  {
    id: 's3', slug: 'homestead-living', name: 'Homestead Living', initials: 'HL',
    tagline: 'Thoughtful home goods & fresh pantry staples',
    about: 'From kitchen appliances to handwoven decor and weekly grocery bundles, Homestead Living curates quality essentials for Nigerian homes.',
    banner: '/images/cat-home.png', rating: 4.6, reviews: 980, followers: 5200,
    location: 'Wuse II, Abuja', joined: '2021', verified: true, responseTime: 'within 2 hours', positiveRate: 96,
  },
  {
    id: 's4', slug: 'glow-and-co', name: 'Glow & Co.', initials: 'GC',
    tagline: '100% authentic skincare, NAFDAC registered',
    about: 'Glow & Co. stocks dermatologist-approved skincare and beauty products. We only work with licensed distributors so you never have to worry about fakes.',
    banner: '/images/cat-beauty.png', rating: 4.7, reviews: 2150, followers: 12800,
    location: 'Lekki, Lagos', joined: '2020', verified: true, responseTime: 'within 1 hour', positiveRate: 97,
  },
  {
    id: 's5', slug: 'velocity-sports', name: 'Velocity Sports & Auto', initials: 'VS',
    tagline: 'Gear up for the pitch and the road',
    about: 'Velocity supplies sportswear, training equipment and car electronics to athletes and drivers across Port Harcourt and beyond.',
    banner: '/images/cat-sports.png', rating: 4.5, reviews: 640, followers: 3100,
    location: 'GRA, Port Harcourt', joined: '2022', verified: false, responseTime: 'within 6 hours', positiveRate: 94,
  },
]

const baseProducts: BaseProduct[] = [
  {
    id: 'p18', slug: 'corolla-2021-sedan', name: 'Toyota Corolla LE 2021 — Foreign Used', brand: 'Toyota', category: 'automotive', sellerId: 's5',
    price: 18500000, compareAt: 19800000, rating: 4.8, reviews: 37, sold: 22, stock: 5,
    image: '/images/p-car.png', gallery: ['/images/p-car.png', '/images/p-car-interior.png'], badge: 'Limited', freeDelivery: false,
    condition: 'Foreign used', unitLabel: 'cars',
    description: 'Clean, accident-free 2021 Corolla LE imported from the US with full customs papers. Low mileage, original paint and a fully documented service history. Five identical units available — inspection welcome at our Port Harcourt yard.',
    highlights: ['Accident-free, original paint', '38,000 km mileage', 'Full customs duty paid', 'Inspection welcome before payment'],
    specs: [{ label: 'Year', value: '2021' }, { label: 'Mileage', value: '38,000 km' }, { label: 'Engine', value: '1.8L 4-cylinder' }, { label: 'Transmission', value: 'Automatic (CVT)' }, { label: 'Fuel', value: 'Petrol' }, { label: 'Interior', value: 'Fabric, beige' }],
    variants: [{ name: 'Colour', options: ['Silver', 'Black', 'White'] }],
  },

  {
    id: 'p1', slug: 'aurora-x5-smartphone', name: 'Aurora X5 Smartphone 256GB', brand: 'Aurora', category: 'phones', sellerId: 's1',
    price: 389000, compareAt: 445000, rating: 4.7, reviews: 812, sold: 3400, stock: 24,
    image: '/images/p-phone.png', gallery: ['/images/p-phone.png', '/images/cat-phones.png'], badge: 'Best seller', freeDelivery: true,
    description: 'A flagship-grade phone with a 6.7" AMOLED display, triple 50MP camera system and an all-day 5,000mAh battery with 65W fast charging.',
    highlights: ['6.7" 120Hz AMOLED display', '50MP triple camera', '5,000mAh battery, 65W charging', 'Dual SIM, 5G ready'],
    specs: [{ label: 'Storage', value: '256GB' }, { label: 'RAM', value: '8GB' }, { label: 'Display', value: '6.7" AMOLED, 120Hz' }, { label: 'Battery', value: '5,000mAh' }, { label: 'Warranty', value: '12 months' }],
    variants: [{ name: 'Colour', options: ['Midnight', 'Frost', 'Sage'] }, { name: 'Storage', options: ['128GB', '256GB', '512GB'] }],
  },
  {
    id: 'p2', slug: 'hush-anc-headphones', name: 'Hush ANC Wireless Headphones', brand: 'Hush', category: 'phones', sellerId: 's1',
    price: 92500, compareAt: 120000, rating: 4.8, reviews: 436, sold: 1900, stock: 40,
    image: '/images/p-headphones.png', gallery: ['/images/p-headphones.png'], freeDelivery: true,
    description: 'Hybrid active noise cancellation, plush memory-foam cushions and up to 40 hours of playback on a single charge.',
    highlights: ['Hybrid active noise cancelling', '40-hour battery life', 'Multipoint Bluetooth 5.3', 'Foldable travel design'],
    specs: [{ label: 'Battery', value: '40 hours' }, { label: 'Connectivity', value: 'Bluetooth 5.3, 3.5mm' }, { label: 'Weight', value: '250g' }, { label: 'Warranty', value: '12 months' }],
    variants: [{ name: 'Colour', options: ['Sage', 'Charcoal', 'Sand'] }],
  },
  {
    id: 'p3', slug: 'pulse-smartwatch', name: 'Pulse Fit Smartwatch', brand: 'Pulse', category: 'phones', sellerId: 's1',
    price: 54900, rating: 4.4, reviews: 289, sold: 1250, stock: 3,
    image: '/images/p-watch.png', gallery: ['/images/p-watch.png'], badge: 'Limited', freeDelivery: false,
    description: 'Track heart rate, sleep, SpO2 and 100+ workout modes with a bright always-on display and 10-day battery.',
    highlights: ['1.43" always-on AMOLED', 'Heart rate & SpO2 tracking', '10-day battery', '5ATM water resistance'],
    specs: [{ label: 'Display', value: '1.43" AMOLED' }, { label: 'Battery', value: 'Up to 10 days' }, { label: 'Water resistance', value: '5ATM' }],
  },
  {
    id: 'p4', slug: 'ember-bluetooth-speaker', name: 'Ember Portable Bluetooth Speaker', brand: 'Ember', category: 'phones', sellerId: 's1',
    price: 38500, compareAt: 45000, rating: 4.6, reviews: 198, sold: 870, stock: 55,
    image: '/images/p-speaker.png', gallery: ['/images/p-speaker.png'], freeDelivery: false,
    description: '360° sound with deep bass in a rugged, waterproof body built for beach days and backyard parties.',
    highlights: ['360° room-filling sound', 'IP67 waterproof', '18-hour playtime', 'Pair two for stereo'],
    specs: [{ label: 'Output', value: '20W' }, { label: 'Battery', value: '18 hours' }, { label: 'Rating', value: 'IP67' }],
  },
  {
    id: 'p5', slug: 'voyager-14-laptop', name: 'Voyager 14 Ultrabook i7 16GB', brand: 'Voyager', category: 'computers', sellerId: 's1',
    price: 845000, compareAt: 920000, rating: 4.7, reviews: 164, sold: 420, stock: 12,
    image: '/images/p-laptop.png', gallery: ['/images/p-laptop.png', '/images/cat-computers.png'], badge: 'New', freeDelivery: true,
    description: 'An aluminium ultrabook that weighs just 1.2kg with a 14" 2.8K display, Intel Core i7 and a battery that lasts the whole workday.',
    highlights: ['Intel Core i7, 16GB RAM', '14" 2.8K display', '1TB NVMe SSD', 'Up to 14 hours battery'],
    specs: [{ label: 'Processor', value: 'Intel Core i7' }, { label: 'RAM', value: '16GB' }, { label: 'Storage', value: '1TB SSD' }, { label: 'Weight', value: '1.2kg' }],
    variants: [{ name: 'Configuration', options: ['i5 / 8GB', 'i7 / 16GB', 'i7 / 32GB'] }],
  },
  {
    id: 'p6', slug: 'wireless-desk-set', name: 'Wireless Keyboard & Mouse Desk Set', brand: 'Voyager', category: 'computers', sellerId: 's1',
    price: 28000, rating: 4.3, reviews: 92, sold: 610, stock: 80,
    image: '/images/cat-computers.png', gallery: ['/images/cat-computers.png'], freeDelivery: false,
    description: 'Quiet low-profile keys and a precise ergonomic mouse, connected with a single USB receiver.',
    highlights: ['Silent typing', 'Single USB receiver', '12-month battery life'],
    specs: [{ label: 'Connectivity', value: '2.4GHz wireless' }, { label: 'Layout', value: 'UK' }],
  },
  {
    id: 'p7', slug: 'ade-ankara-midi-dress', name: 'Adé Ankara Wrap Midi Dress', brand: 'Ankara House', category: 'fashion', sellerId: 's2',
    price: 32000, compareAt: 38000, rating: 4.9, reviews: 312, sold: 1500, stock: 18,
    image: '/images/p-ankara.png', gallery: ['/images/p-ankara.png', '/images/banner-fashion.png'], badge: 'Best seller', freeDelivery: true,
    description: 'A flattering wrap silhouette in 100% cotton wax print, finished with a tie waist and hidden side pockets.',
    highlights: ['100% cotton wax print', 'Adjustable tie waist', 'Hidden side pockets', 'Handmade in Lagos'],
    specs: [{ label: 'Material', value: '100% cotton' }, { label: 'Care', value: 'Hand wash cold' }, { label: 'Fit', value: 'True to size' }],
    variants: [{ name: 'Size', options: ['XS', 'S', 'M', 'L', 'XL'] }],
  },
  {
    id: 'p8', slug: 'lagos-leather-sneakers', name: 'Lagos Classic Leather Sneakers', brand: 'Ankara House', category: 'fashion', sellerId: 's2',
    price: 45000, rating: 4.6, reviews: 204, sold: 980, stock: 34,
    image: '/images/p-sneakers.png', gallery: ['/images/p-sneakers.png'], badge: 'New', freeDelivery: true,
    description: 'Minimal full-grain leather sneakers with a cushioned insole and durable rubber cupsole.',
    highlights: ['Full-grain leather upper', 'Cushioned insole', 'Stitched rubber sole'],
    specs: [{ label: 'Upper', value: 'Leather' }, { label: 'Sole', value: 'Rubber' }],
    variants: [{ name: 'Size', options: ['40', '41', '42', '43', '44', '45'] }],
  },
  {
    id: 'p9', slug: 'ivy-leather-tote', name: 'Ivy Leather Tote Bag', brand: 'Ankara House', category: 'fashion', sellerId: 's2',
    price: 58500, compareAt: 65000, rating: 4.7, reviews: 118, sold: 430, stock: 9,
    image: '/images/p-bag.png', gallery: ['/images/p-bag.png'], freeDelivery: false,
    description: 'A roomy everyday tote in soft tan leather with an interior zip pocket and laptop sleeve.',
    highlights: ['Genuine leather', 'Fits 14" laptop', 'Interior zip pocket'],
    specs: [{ label: 'Dimensions', value: '38 × 30 × 14 cm' }, { label: 'Material', value: 'Leather' }],
  },
  {
    id: 'p10', slug: 'glow-vitamin-c-serum', name: 'Radiance Vitamin C Brightening Serum 30ml', brand: 'Glow & Co.', category: 'beauty', sellerId: 's4',
    price: 14500, compareAt: 18000, rating: 4.8, reviews: 1043, sold: 6200, stock: 120,
    image: '/images/p-serum.png', gallery: ['/images/p-serum.png', '/images/cat-beauty.png'], badge: 'Best seller', freeDelivery: false,
    description: '15% vitamin C with hyaluronic acid and ferulic acid to fade dark spots and boost radiance. Suitable for all skin types.',
    highlights: ['15% stabilised vitamin C', 'Fades hyperpigmentation', 'NAFDAC registered', 'Cruelty free'],
    specs: [{ label: 'Volume', value: '30ml' }, { label: 'Skin type', value: 'All skin types' }],
  },
  {
    id: 'p11', slug: 'daily-skincare-kit', name: 'Daily Glow Skincare Kit', brand: 'Glow & Co.', category: 'beauty', sellerId: 's4',
    price: 36000, compareAt: 42000, rating: 4.6, reviews: 276, sold: 1100, stock: 60,
    image: '/images/cat-beauty.png', gallery: ['/images/cat-beauty.png'], freeDelivery: true,
    description: 'A complete morning-to-night routine: gentle cleanser, toner, serum and SPF 50 moisturiser.',
    highlights: ['4-step routine', 'Includes SPF 50', 'Travel friendly sizes'],
    specs: [{ label: 'Items', value: '4' }],
  },
  {
    id: 'p12', slug: 'rattan-table-lamp', name: 'Woven Rattan Table Lamp', brand: 'Homestead', category: 'home', sellerId: 's3',
    price: 26500, rating: 4.5, reviews: 88, sold: 320, stock: 15,
    image: '/images/p-lamp.png', gallery: ['/images/p-lamp.png', '/images/cat-home.png'], freeDelivery: false,
    description: 'Hand-woven rattan base with a natural linen shade that casts a warm, soft glow.',
    highlights: ['Hand-woven rattan', 'Linen shade', 'E27 bulb fitting'],
    specs: [{ label: 'Height', value: '48cm' }, { label: 'Bulb', value: 'E27, not included' }],
  },
  {
    id: 'p13', slug: 'problend-1200-blender', name: 'ProBlend 1200W Countertop Blender', brand: 'Homestead', category: 'home', sellerId: 's3',
    price: 67000, compareAt: 79000, rating: 4.6, reviews: 241, sold: 760, stock: 22,
    image: '/images/p-blender.png', gallery: ['/images/p-blender.png'], freeDelivery: true,
    description: 'Crush ice, blend pepper and make smoothies in seconds with a 1200W motor and 1.8L glass jar.',
    highlights: ['1200W motor', '1.8L glass jar', '6 speed settings', 'Stainless steel blades'],
    specs: [{ label: 'Power', value: '1200W' }, { label: 'Capacity', value: '1.8L' }, { label: 'Warranty', value: '24 months' }],
  },
  {
    id: 'p14', slug: 'market-fresh-bundle', name: 'Market Fresh Weekly Bundle', brand: 'Homestead', category: 'grocery', sellerId: 's3',
    price: 24000, rating: 4.4, reviews: 156, sold: 2300, stock: 200,
    image: '/images/cat-grocery.png', gallery: ['/images/cat-grocery.png'], badge: 'New', freeDelivery: true,
    description: 'Tomatoes, peppers, yam, 5kg rice and palm oil — everything for a week of home cooking.',
    highlights: ['Sourced from local farms', 'Same-day delivery in Abuja', 'Packed fresh each morning'],
    specs: [{ label: 'Weight', value: '~12kg' }],
  },
  {
    id: 'p15', slug: 'green-eagles-fan-jersey', name: 'Green Eagles Home Fan Jersey', brand: 'Velocity', category: 'sports', sellerId: 's5',
    price: 22000, compareAt: 27500, rating: 4.5, reviews: 310, sold: 1800, stock: 70,
    image: '/images/p-jersey.png', gallery: ['/images/p-jersey.png'], freeDelivery: false,
    description: 'Breathable, quick-dry fan jersey in signature green and white.',
    highlights: ['Quick-dry fabric', 'Regular fit', 'Machine washable'],
    specs: [{ label: 'Material', value: '100% polyester' }],
    variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL', 'XXL'] }],
  },
  {
    id: 'p16', slug: 'pro-training-kit', name: 'Pro Home Training Kit', brand: 'Velocity', category: 'sports', sellerId: 's5',
    price: 49000, rating: 4.3, reviews: 64, sold: 210, stock: 14,
    image: '/images/cat-sports.png', gallery: ['/images/cat-sports.png'], freeDelivery: false,
    description: 'Adjustable dumbbells, a size-5 match ball and training shoes bag — everything to train at home.',
    highlights: ['Adjustable 2–10kg dumbbells', 'Size 5 match ball'],
    specs: [{ label: 'Items', value: '3' }],
  },
  {
    id: 'p17', slug: 'roadeye-dash-cam', name: 'RoadEye 2K Dash Camera', brand: 'RoadEye', category: 'automotive', sellerId: 's5',
    price: 41500, compareAt: 52000, rating: 4.4, reviews: 133, sold: 540, stock: 26,
    image: '/images/p-dashcam.png', gallery: ['/images/p-dashcam.png', '/images/cat-automotive.png'], freeDelivery: true,
    description: 'Crisp 2K recording with night vision, loop recording and an automatic collision lock.',
    highlights: ['2K QHD recording', 'Night vision', 'G-sensor collision lock', 'Wi-Fi app'],
    specs: [{ label: 'Resolution', value: '2560 × 1440' }, { label: 'Field of view', value: '140°' }],
  },
]

const featureSets: Record<string, Product['features']> = {
  'corolla-2021-sedan': [
    { title: 'Toyota Safety Sense', description: 'Pre-collision braking, lane departure alert and adaptive cruise control.' },
    { title: 'Apple CarPlay & Android Auto', description: '8" touchscreen with wireless phone mirroring and reverse camera.' },
    { title: 'Fuel efficient', description: 'Around 15 km per litre on mixed city and highway driving.' },
    { title: 'Verified documents', description: 'Customs papers, plate number and proof of ownership ready for transfer.' },
  ],
  'aurora-x5-smartphone': [
    { title: 'Pro-grade camera', description: 'Triple 50MP system with optical stabilisation and 4K video.' },
    { title: 'All-day battery', description: '5,000mAh cell that goes from 0 to 70% in 20 minutes.' },
    { title: 'Smooth display', description: '6.7" 120Hz AMOLED that stays readable in direct sunlight.' },
  ],
  'voyager-14-laptop': [
    { title: 'Featherweight build', description: 'Aluminium unibody at only 1.2kg — easy to carry all day.' },
    { title: 'Long battery life', description: 'Up to 14 hours of work on a single charge.' },
    { title: 'Fast storage', description: '1TB NVMe SSD boots in seconds.' },
  ],
}

const negotiableCategories = new Set(['automotive', 'computers', 'phones', 'home', 'fashion', 'sports'])

const productsWithVideo = new Set([
  'ade-ankara-midi-dress', 'aurora-x5-smartphone', 'daily-skincare-kit', 'ember-bluetooth-speaker',
  'glow-vitamin-c-serum', 'hush-anc-headphones', 'ivy-leather-tote', 'lagos-leather-sneakers',
  'pulse-smartwatch', 'rattan-table-lamp', 'voyager-14-laptop', 'wireless-desk-set',
])

export const products: Product[] = baseProducts.map((p) => ({
  ...p,
  video: productsWithVideo.has(p.slug) ? `/videos/${p.slug}.mp4` : undefined,
  negotiable: negotiableCategories.has(p.category),
  features:
    featureSets[p.slug] ??
    p.highlights.map((h) => ({ title: h, description: `${p.brand} ${p.name.split(' ').slice(1, 3).join(' ').toLowerCase()} — ${h.toLowerCase()}.` })),
}))

export const reviewsSample = [
  { id: 'r1', name: 'Chiamaka O.', rating: 5, date: 'Sep 28, 2026', title: 'Exactly as described', body: 'Arrived in two days, well packaged and genuine. The seller even followed up to make sure everything was fine.', verified: true },
  { id: 'r2', name: 'Tunde A.', rating: 4, date: 'Sep 14, 2026', title: 'Great value', body: 'Quality is very good for the price. Delivery took a day longer than expected but customer service kept me updated.', verified: true },
  { id: 'r3', name: 'Halima B.', rating: 5, date: 'Aug 30, 2026', title: 'Would buy again', body: 'Second time ordering from this store. Consistent quality and the escrow payment gives me peace of mind.', verified: true },
]

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug)
export const getSeller = (idOrSlug: string) => sellers.find((s) => s.id === idOrSlug || s.slug === idOrSlug)
export const getProduct = (slug: string) => products.find((p) => p.slug === slug)
export const getProductsByCategory = (slug: string) => products.filter((p) => p.category === slug)
export const getProductsBySeller = (sellerId: string) => products.filter((p) => p.sellerId === sellerId)
export const getDeals = () => products.filter((p) => p.compareAt).sort((a, b) => discount(b) - discount(a))

export function discount(p: Pick<Product, 'price' | 'compareAt'>) {
  if (!p.compareAt) return 0
  return Math.round(((p.compareAt - p.price) / p.compareAt) * 100)
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return products
  const terms = q.split(/\s+/)
  return products.filter((p) => {
    const haystack = `${p.name} ${p.brand} ${getCategory(p.category)?.name ?? ''} ${getSeller(p.sellerId)?.name ?? ''}`.toLowerCase()
    return terms.every((t) => haystack.includes(t))
  })
}

const naira = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })
export const formatPrice = (value: number) => naira.format(value)

export const formatCompact = (value: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
