// Payload API Types
export interface User {
  id: string
  email: string
  role: 'admin' | 'brandOwner' | 'brandStaff' | 'support'
  brand?: string | Brand
  firstName?: string
  lastName?: string
  createdAt: string
  updatedAt: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo?: Media
  coverImage?: Media
  shortDescription?: string
  longDescription?: string
  giftFit?: string
  styleTags?: string[]
  country: string
  baseCurrency: 'GBP' | 'USD' | 'EUR'
  websiteUrl?: string
  instagramHandle?: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  stripeOnboardingStatus: 'not_started' | 'in_progress' | 'complete'
  stripeConnectAccountId?: string
  createdAt: string
  updatedAt: string
}

export interface Media {
  id: string
  url: string
  filename: string
  mimeType: string
  filesize: number
  width?: number
  height?: number
  alt: string
  sizes?: {
    thumbnail?: { url: string; width: number; height: number }
    card?: { url: string; width: number; height: number }
    tablet?: { url: string; width: number; height: number }
  }
}

export interface Product {
  id: string
  title: string
  slug: string
  brand: string | Brand
  status: 'draft' | 'published' | 'archived'
  primaryImage?: Media
  gallery?: { image: Media }[]
  shortDescription?: string
  description?: string
  giftTags?: { tag: string }[]
  occasionFit?: string[]
  styleTags?: string[]
  hasVariants: boolean
  defaultPrice?: number
  defaultCurrency?: 'GBP' | 'USD' | 'EUR'
  defaultSku?: string
  defaultStock?: number
  isFeatured: boolean
  visibleToGifter: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductVariant {
  id: string
  product: string | Product
  optionValues: { option: string; value: string }[]
  sku: string
  price: number
  currency: 'GBP' | 'USD' | 'EUR'
  stock?: number
  stripePriceId?: string
}

export interface Order {
  id: string
  orderNumber: string
  brand: string | Brand
  customer?: Customer
  coreUserId?: string
  coreOccasionId?: string
  currency: 'GBP' | 'USD' | 'EUR'
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded'
  paidAt?: string
  fulfilledAt?: string
  shippingAddress?: {
    firstName?: string
    lastName?: string
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  buyerNote?: string
  internalNotes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  order: string | Order
  product: string | Product
  variant?: string | ProductVariant
  quantity: number
  unitPrice: number
  currency: 'GBP' | 'USD' | 'EUR'
  subtotal: number
  productTitle: string
  variantSummary?: string
  brandName?: string
  image?: Media
}

export interface Customer {
  id: string
  email: string
  firstName?: string
  lastName?: string
  brand: string | Brand
  externalUserId?: string
  createdAt: string
  updatedAt: string
}

export interface Payout {
  id: string
  brand: string | Brand
  order?: string | Order
  type: 'payout' | 'platformFee' | 'refund' | 'adjustment'
  amount: number
  currency: 'GBP' | 'USD' | 'EUR'
  stripeTransferId?: string
  description?: string
  createdAt: string
}

// API Response types
export interface PayloadResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

export interface PayloadDoc<T> {
  doc: T
}

export interface AuthResponse {
  user: User
  token: string
  exp: number
}

export interface PayloadError {
  message: string
  errors?: Array<{ message: string; field: string }>
}
