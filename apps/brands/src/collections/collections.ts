import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin.js'

export const Collections: CollectionConfig = {
  slug: 'collections',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'isFeatured', 'targetPersona'],
    group: 'Commerce',
  },
  access: {
    create: isAdmin,
    read: ({ req: { user } }) => {
      // Public can read curated collections
      if (!user) return true

      return true
    },
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [
          ({ data, operation }) => {
            if (operation === 'create' && data?.title && !data?.slug) {
              return data.title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
            }
          },
        ],
      },
    },
    {
      name: 'subtitle',
      type: 'text',
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'products',
      type: 'array',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'sortIndex',
          type: 'number',
          admin: {
            description: 'Order in which products appear',
          },
        },
      ],
      admin: {
        description: 'Manually curated products',
      },
    },
    {
      name: 'filters',
      type: 'json',
      admin: {
        description: 'Optional dynamic filters for collection (JSON)',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'targetPersona',
      type: 'text',
      admin: {
        description: 'Who is this collection for?',
        placeholder: 'For the design-obsessed friend',
      },
    },
    {
      name: 'targetOccasion',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Birthday', value: 'birthday' },
        { label: 'Anniversary', value: 'anniversary' },
        { label: 'Housewarming', value: 'housewarming' },
        { label: 'Thank You', value: 'thankyou' },
        { label: 'Just Because', value: 'justbecause' },
        { label: 'Wedding', value: 'wedding' },
        { label: 'Baby Shower', value: 'babyshower' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Hero image for the collection',
      },
    },
  ],
}
