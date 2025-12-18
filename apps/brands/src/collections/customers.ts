import type { CollectionConfig } from 'payload'
import { filterByBrandField } from '../access/brandAccess.js'
import { isAdmin } from '../access/isAdmin.js'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'brand'],
    group: 'Commerce',
  },
  access: {
    create: filterByBrandField('brand'),
    read: filterByBrandField('brand'),
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
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
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      required: true,
      admin: {
        description: 'The brand this customer has purchased from',
      },
    },
    {
      name: 'externalUserId',
      type: 'text',
      admin: {
        description: 'Link to Core Gifter user ID (from Prisma DB)',
      },
    },
  ],
}
