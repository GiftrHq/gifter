import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin.js'

export const OrderItems: CollectionConfig = {
  slug: 'orderItems',
  admin: {
    useAsTitle: 'productTitle',
    defaultColumns: ['order', 'productTitle', 'quantity', 'unitPrice', 'subtotal'],
    group: 'Commerce',
  },
  access: {
    create: isAdmin,
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'support') return true

      // Brand users can see order items for their brand's orders
      if (user.role === 'brandOwner' || user.role === 'brandStaff') {
        // Extract brand ID - handle both number ID and populated object
        const brandId = typeof user.brand === 'number' ? user.brand : (user.brand as any)?.id

        return {
          'order.brand': {
            equals: brandId,
          },
        }
      }
      return false
    },
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'variant',
      type: 'relationship',
      relationTo: 'productVariants',
      admin: {
        description: 'Specific variant if applicable',
      },
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Price per unit at time of order',
          },
        },
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
      ],
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'quantity × unitPrice',
      },
    },
    // Snapshot fields to preserve order data even if product changes
    {
      type: 'collapsible',
      label: 'Snapshot Data',
      admin: {
        description: 'Product data at time of order (preserved)',
      },
      fields: [
        {
          name: 'productTitle',
          type: 'text',
          required: true,
          admin: {
            description: 'Product title at time of order',
          },
        },
        {
          name: 'variantSummary',
          type: 'text',
          admin: {
            description: 'Variant description (e.g., "Size: M, Color: Black")',
          },
        },
        {
          name: 'brandName',
          type: 'text',
          admin: {
            description: 'Brand name at time of order',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Product image at time of order',
          },
        },
      ],
    },
  ],
}
