import type { CollectionConfig } from 'payload'
import { filterByBrandField } from '../access/brandAccess.js'

export const ProductVariants: CollectionConfig = {
  slug: 'productVariants',
  admin: {
    useAsTitle: 'sku',
    defaultColumns: ['product', 'sku', 'price', 'stock'],
    group: 'Commerce',
  },
  access: {
    create: filterByBrandField('product.brand'),
    read: filterByBrandField('product.brand'),
    update: filterByBrandField('product.brand'),
    delete: filterByBrandField('product.brand'),
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      admin: {
        description: 'The parent product',
      },
    },
    {
      name: 'optionValues',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'option',
          type: 'text',
          required: true,
          admin: {
            description: 'Option name (e.g., "Size", "Color")',
          },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: {
            description: 'Option value (e.g., "M", "Black")',
          },
        },
      ],
      admin: {
        description: 'Variant options (e.g., Size: M, Color: Black)',
      },
    },
    {
      name: 'sku',
      type: 'text',
      required: true,
      admin: {
        description: 'Stock keeping unit / variant code',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
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
      name: 'stock',
      type: 'number',
      min: 0,
      admin: {
        description: 'Available stock for this variant (leave empty for external inventory)',
      },
    },
    {
      name: 'stripePriceId',
      type: 'text',
      admin: {
        description: 'Stripe Price ID for this variant',
        readOnly: true,
      },
    },
  ],
}
