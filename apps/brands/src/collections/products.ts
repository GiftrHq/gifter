import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin.js'
import { filterByBrandField } from '../access/brandAccess.js'
import { notifyCoreApiOnProductChange } from '../hooks/products.js'

export const Products: CollectionConfig = {
  slug: 'products',
  hooks: {
    afterChange: [notifyCoreApiOnProductChange],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'brand', 'status', 'defaultPrice'],
    group: 'Commerce',
  },
  access: {
    create: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      // Brand users can create products if their brand is approved
      if (user.role === 'brandOwner' || user.role === 'brandStaff') {
        return Boolean(user.brand)
      }
      return false
    },
    read: ({ req }) => {
      // Public API: only published products from approved brands
      if (!req.user) {
        return {
          and: [
            {
              status: {
                equals: 'published',
              },
            },
            {
              'brand.status': {
                equals: 'approved',
              },
            },
          ],
        }
      }

      return filterByBrandField('brand')({ req })
    },
    update: filterByBrandField('brand'),
    delete: filterByBrandField('brand'),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basics',
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
              admin: {
                description: 'Auto-generated from title',
              },
              hooks: {
                beforeValidate: [
                  ({ value, data, operation }) => {
                    // Auto-generate slug from title if not provided
                    if (operation === 'create' && !value && data?.title) {
                      return data.title
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '')
                    }
                    return value
                  },
                ],
              },
            },
            {
              name: 'brand',
              type: 'relationship',
              relationTo: 'brands',
              required: true,
              admin: {
                description: 'The brand that owns this product',
              },
              // Auto-set brand for brand users
              hooks: {
                beforeValidate: [
                  ({ req, operation, data }) => {
                    if (
                      operation === 'create' &&
                      req.user &&
                      (req.user.role === 'brandOwner' ||
                        req.user.role === 'brandStaff')
                    ) {
                      // Extract brand ID - handle both number and populated object
                      const brandId = typeof req.user.brand === 'number'
                        ? req.user.brand
                        : (req.user.brand as any)?.id
                      return brandId
                    }
                  },
                ],
              },
            },
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'draft',
              options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' },
              ],
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              maxLength: 200,
              admin: {
                description: 'Short description appears first. Think of it as how I introduce the product in a sentence.',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'Full product description with details',
              },
            },
            {
              name: 'specs',
              type: 'textarea',
              admin: {
                description: 'Technical specifications or product details',
              },
            },
          ],
        },
        {
          label: 'Media',
          fields: [
            {
              name: 'primaryImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Main product image',
              },
            },
            {
              name: 'gallery',
              type: 'array',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
              admin: {
                description: 'Clear, editorial photography helps me present you well inside Gifter.',
              },
            },
          ],
        },
        {
          label: 'Gift Context',
          fields: [
            {
              name: 'giftTags',
              type: 'array',
              fields: [
                {
                  name: 'tag',
                  type: 'text',
                },
              ],
              admin: {
                description: 'Tags like "For the ritualist", "For the host", "Under £50", etc.',
              },
            },
            {
              name: 'occasionFit',
              type: 'select',
              hasMany: true,
              required: false,
              defaultValue: [],
              options: [
                { label: 'Birthday', value: 'birthday' },
                { label: 'Anniversary', value: 'anniversary' },
                { label: 'Housewarming', value: 'housewarming' },
                { label: 'Thank You', value: 'thankyou' },
                { label: 'Just Because', value: 'justbecause' },
                { label: 'Wedding', value: 'wedding' },
                { label: 'Baby Shower', value: 'babyshower' },
              ],
              admin: {
                description: 'Which occasions is this product suitable for?',
              },
            },
            {
              name: 'styleTags',
              type: 'select',
              hasMany: true,
              required: false,
              defaultValue: [],
              options: [
                { label: 'Minimal', value: 'minimal' },
                { label: 'Bold', value: 'bold' },
                { label: 'Cozy', value: 'cozy' },
                { label: 'Luxurious', value: 'luxurious' },
                { label: 'Playful', value: 'playful' },
                { label: 'Earthy', value: 'earthy' },
                { label: 'Modern', value: 'modern' },
                { label: 'Classic', value: 'classic' },
              ],
              admin: {
                description: 'These help me understand who this is for. I use them when lining up recommendations.',
              },
            },
          ],
        },
        {
          label: 'Pricing & Variants',
          fields: [
            {
              name: 'hasVariants',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Does this product have variants (e.g., sizes, colors)?',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'defaultPrice',
                  type: 'number',
                  required: true,
                  min: 0,
                  admin: {
                    description: 'Base price (or only price if no variants)',
                    condition: (data) => !data?.hasVariants,
                  },
                },
                {
                  name: 'defaultCurrency',
                  type: 'select',
                  required: true,
                  defaultValue: 'GBP',
                  options: [
                    { label: 'GBP (£)', value: 'GBP' },
                    { label: 'USD ($)', value: 'USD' },
                    { label: 'EUR (€)', value: 'EUR' },
                  ],
                  admin: {
                    condition: (data) => !data?.hasVariants,
                  },
                },
              ],
            },
            {
              name: 'defaultSku',
              type: 'text',
              admin: {
                description: 'SKU (if no variants)',
                condition: (data) => !data?.hasVariants,
              },
            },
            {
              name: 'defaultStock',
              type: 'number',
              min: 0,
              admin: {
                description: 'Stock quantity (if no variants)',
                condition: (data) => !data?.hasVariants,
              },
            },
          ],
        },
        {
          label: 'Visibility',
          fields: [
            {
              name: 'isFeatured',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Featured products may appear in curated collections',
              },
            },
            {
              name: 'visibleToGifter',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Is this product available to Gifter app users?',
              },
            },
          ],
        },
      ],
    },
  ],
}
