import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/isAdmin.js'

export const CommerceSettings: GlobalConfig = {
  slug: 'commerceSettings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Platform Fees',
          fields: [
            {
              name: 'platformFeePercent',
              type: 'number',
              required: true,
              defaultValue: 15,
              min: 0,
              max: 100,
              admin: {
                description: 'Default platform commission percentage',
              },
            },
          ],
        },
        {
          label: 'Currencies & Countries',
          fields: [
            {
              name: 'supportedCurrencies',
              type: 'select',
              hasMany: true,
              defaultValue: ['GBP', 'USD', 'EUR'],
              options: [
                { label: 'GBP (£)', value: 'GBP' },
                { label: 'USD ($)', value: 'USD' },
                { label: 'EUR (€)', value: 'EUR' },
              ],
            },
            {
              name: 'allowedCountries',
              type: 'array',
              fields: [
                {
                  name: 'code',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Stripe Configuration',
          fields: [
            {
              name: 'stripePublishableKey',
              type: 'text',
              admin: {
                description: 'Stripe publishable key (can be test or live)',
              },
            },
            {
              name: 'returnUrlBase',
              type: 'text',
              admin: {
                description: 'Base URL for Stripe Connect return URL',
                placeholder: 'https://brands.gifter.com/settings/payouts/success',
              },
            },
            {
              name: 'refreshUrlBase',
              type: 'text',
              admin: {
                description: 'Base URL for Stripe Connect refresh URL',
                placeholder: 'https://brands.gifter.com/settings/payouts',
              },
            },
          ],
        },
      ],
    },
  ],
}
