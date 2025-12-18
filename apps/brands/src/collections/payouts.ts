import type { CollectionConfig } from 'payload'
import { filterByBrandField } from '../access/brandAccess.js'
import { isAdmin } from '../access/isAdmin.js'

export const Payouts: CollectionConfig = {
  slug: 'payouts',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['brand', 'type', 'amount', 'currency', 'createdAt'],
    group: 'Commerce',
  },
  access: {
    create: isAdmin,
    read: filterByBrandField('brand'),
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      required: true,
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      admin: {
        description: 'Related order (if applicable)',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Payout', value: 'payout' },
        { label: 'Platform Fee', value: 'platformFee' },
        { label: 'Refund', value: 'refund' },
        { label: 'Adjustment', value: 'adjustment' },
      ],
      admin: {
        description: 'Type of transaction',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'amount',
          type: 'number',
          required: true,
          admin: {
            description: 'Amount (can be negative for fees/refunds)',
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
      name: 'stripeTransferId',
      type: 'text',
      admin: {
        description: 'Stripe Transfer ID',
      },
    },
    {
      name: 'stripeBalanceTransactionId',
      type: 'text',
      admin: {
        description: 'Stripe Balance Transaction ID',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of this transaction',
      },
    },
  ],
}
