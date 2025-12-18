import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { stripePlugin } from '@payloadcms/plugin-stripe'
import path from 'path'

// Collections
import { Users } from './collections/users.js'
import { Brands } from './collections/brands.js'
import { Media } from './collections/media.js'
import { Products } from './collections/products.js'
import { ProductVariants } from './collections/productVariants.js'
import { Orders } from './collections/orders.js'
import { OrderItems } from './collections/orderItems.js'
import { Customers } from './collections/customers.js'
import { Payouts } from './collections/payouts.js'
import { Collections } from './collections/collections.js'

// Globals
import { CommerceSettings } from './globals/commerceSettings.js'

// Endpoints
import { generateOnboardingLink } from './endpoints/stripeOnboarding.js'
import { stripeWebhookHandler } from './endpoints/stripeWebhook.js'

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),

  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Gifter Commerce',
    },
  },

  editor: lexicalEditor(),

  collections: [
    Users,
    Brands,
    Media,
    Products,
    ProductVariants,
    Orders,
    OrderItems,
    Customers,
    Payouts,
    Collections,
  ],

  globals: [CommerceSettings],

  plugins: [
    stripePlugin({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
      isTestKey: process.env.STRIPE_SECRET_KEY?.includes('test') || true,
      // No sync needed - we only use Stripe Connect for payouts, not product management
    }),
  ],
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
    process.env.CORE_API_URL || 'http://localhost:3000',
    'http://localhost:3002', // Brand Panel frontend
  ].filter(Boolean) as string[],
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
    process.env.CORE_API_URL || 'http://localhost:3000',
    'http://localhost:3002', // Brand Panel frontend
  ].filter(Boolean) as string[],
  endpoints: [
    {
      path: '/brands/:id/stripe/onboard',
      method: 'post',
      handler: generateOnboardingLink as any,
    },
    {
      path: '/stripe/webhook',
      method: 'post',
      handler: stripeWebhookHandler as any,
    },
  ],
})
