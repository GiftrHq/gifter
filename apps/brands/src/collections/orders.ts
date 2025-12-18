import type { CollectionConfig } from 'payload'
import { filterByBrandField } from '../access/brandAccess.js'
import { isAdmin } from '../access/isAdmin.js'
import { notifyCoreApiOnOrderStatusChange } from '../hooks/orders.js'

export const Orders: CollectionConfig = {
  slug: 'orders',
  hooks: {
    afterChange: [notifyCoreApiOnOrderStatusChange],
  },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'brand', 'total', 'status', 'paidAt'],
    group: 'Commerce',
  },
  access: {
    create: isAdmin,
    read: filterByBrandField('brand'),
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'support') return true

      // Brand users can update limited fields on their orders
      if (user.role === 'brandOwner' || user.role === 'brandStaff') {
        // Extract brand ID - handle both number ID and populated object
        const brandId = typeof user.brand === 'number' ? user.brand : (user.brand as any)?.id

        return {
          brand: {
            equals: brandId,
          },
        }
      }
      return false
    },
    delete: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Order Details',
          fields: [
            {
              name: 'orderNumber',
              type: 'text',
              required: true,
              unique: true,
              admin: {
                description: 'Unique order identifier',
              },
            },
            {
              name: 'brand',
              type: 'relationship',
              relationTo: 'brands',
              required: true,
            },
            {
              name: 'customer',
              type: 'relationship',
              relationTo: 'customers',
            },
            {
              name: 'coreUserId',
              type: 'text',
              admin: {
                description: 'User ID from Core Gifter API (Prisma)',
              },
            },
            {
              name: 'coreOccasionId',
              type: 'text',
              admin: {
                description: 'Occasion ID from Core Gifter API (Prisma)',
              },
            },
          ],
        },
        {
          label: 'Amounts',
          fields: [
            {
              name: 'currency',
              type: 'select',
              required: true,
              defaultValue: 'GBP',
              options: [
                { label: 'GBP (£)', value: 'GBP' },
                { label: 'USD ($)', value: 'USD' },
                { label: 'EUR (€)', value: 'EUR' },
              ],
            },
            {
              name: 'subtotal',
              type: 'number',
              required: true,
              min: 0,
              admin: {
                description: 'Subtotal before shipping and tax',
              },
            },
            {
              name: 'shipping',
              type: 'number',
              defaultValue: 0,
              min: 0,
            },
            {
              name: 'tax',
              type: 'number',
              defaultValue: 0,
              min: 0,
            },
            {
              name: 'total',
              type: 'number',
              required: true,
              min: 0,
              admin: {
                description: 'Final total amount',
              },
            },
          ],
        },
        {
          label: 'Status',
          fields: [
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'pending',
              options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Paid', value: 'paid' },
                { label: 'Fulfilled', value: 'fulfilled' },
                { label: 'Cancelled', value: 'cancelled' },
                { label: 'Refunded', value: 'refunded' },
              ],
            },
            {
              name: 'paidAt',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
                description: 'When payment was completed',
              },
            },
            {
              name: 'fulfilledAt',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
                description: 'When order was marked as fulfilled',
              },
            },
          ],
        },
        {
          label: 'Stripe',
          fields: [
            {
              name: 'stripePaymentIntentId',
              type: 'text',
              admin: {
                description: 'Stripe PaymentIntent ID',
              },
            },
            {
              name: 'stripeChargeId',
              type: 'text',
              admin: {
                description: 'Stripe Charge ID',
              },
            },
            {
              name: 'stripeTransferId',
              type: 'text',
              admin: {
                description: 'Stripe Transfer ID (if using separate transfers)',
              },
            },
            {
              name: 'stripeFeeAmount',
              type: 'number',
              admin: {
                description: 'Stripe processing fee (for reporting)',
              },
            },
            {
              name: 'platformFeeAmount',
              type: 'number',
              admin: {
                description: 'Platform commission fee',
              },
            },
          ],
        },
        {
          label: 'Shipping & Notes',
          fields: [
            {
              name: 'shippingAddress',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'firstName',
                      type: 'text',
                    },
                    {
                      name: 'lastName',
                      type: 'text',
                    },
                  ],
                },
                {
                  name: 'line1',
                  type: 'text',
                },
                {
                  name: 'line2',
                  type: 'text',
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'city',
                      type: 'text',
                    },
                    {
                      name: 'state',
                      type: 'text',
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'postalCode',
                      type: 'text',
                    },
                    {
                      name: 'country',
                      type: 'text',
                    },
                  ],
                },
              ],
            },
            {
              name: 'buyerNote',
              type: 'textarea',
              admin: {
                description: 'Note from the buyer',
              },
            },
            {
              name: 'internalNotes',
              type: 'textarea',
              admin: {
                description: 'Internal notes (brand/admin only)',
              },
            },
          ],
        },
      ],
    },
  ],
}
