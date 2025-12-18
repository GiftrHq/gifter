import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin.js'
import { filterByBrand } from '../access/brandAccess.js'
import { createStripeConnectAccount } from '../hooks/brands.js'

export const Brands: CollectionConfig = {
  slug: 'brands',
  hooks: {
    beforeChange: [
      // Ensure non-admins can only create brands with pending status
      ({ data, operation, req }) => {
        if (operation === 'create') {
          const user = req.user
          // Force pending status for non-admin creators
          if (!user || (user.role !== 'admin' && user.role !== 'support')) {
            data.status = 'pending'
            data.stripeOnboardingStatus = 'not_started'
          }
        }
        return data
      },
    ],
    afterChange: [createStripeConnectAccount],
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'stripeOnboardingStatus', 'country'],
    group: 'Commerce',
  },
  access: {
    // Allow anyone to create brands (for signup), but hooks ensure status starts as pending
    create: () => true,
    read: filterByBrand, // Brand users see their brand, admins see all
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'support') return true

      // Brand users can update their own brand (but not admin-only fields)
      if (user.role === 'brandOwner' || user.role === 'brandStaff') {
        // Extract brand ID - handle both number ID and populated object
        const brandId = typeof user.brand === 'number' ? user.brand : (user.brand as any)?.id

        return {
          id: {
            equals: brandId,
          },
        }
      }
      return false
    },
    delete: isAdmin,
  },
  fields: [
    // === Core Identity ===
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: {
                description: 'Brand name as shown to customers',
              },
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              admin: {
                description: 'URL-friendly identifier',
              },
              hooks: {
                beforeValidate: [
                  ({ value, data, operation }) => {
                    // Auto-generate slug from name if not provided
                    if (operation === 'create' && !value && data?.name) {
                      return data.name
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
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Square logo, monochrome recommended',
              },
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              maxLength: 200,
              admin: {
                description: 'Brief introduction to the brand',
              },
            },
            {
              name: 'longDescription',
              type: 'richText',
              admin: {
                description: 'Full brand story and details',
              },
            },
          ],
        },
        {
          label: 'Gift Positioning',
          fields: [
            {
              name: 'giftFit',
              type: 'text',
              admin: {
                description: 'Who this brand is for (e.g., "For the design-obsessed homebody")',
                placeholder: 'For the...',
              },
            },
            {
              name: 'styleTags',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'Minimal', value: 'minimal' },
                { label: 'Cozy', value: 'cozy' },
                { label: 'Playful', value: 'playful' },
                { label: 'Luxurious', value: 'luxurious' },
                { label: 'Bold', value: 'bold' },
                { label: 'Earthy', value: 'earthy' },
                { label: 'Modern', value: 'modern' },
                { label: 'Classic', value: 'classic' },
              ],
              admin: {
                description: 'Style and vibe of the brand',
              },
            },
          ],
        },
        {
          label: 'Business Details',
          fields: [
            {
              name: 'country',
              type: 'select',
              required: true,
              options: [
                { label: 'United Kingdom', value: 'GB' },
                { label: 'United States', value: 'US' },
                { label: 'France', value: 'FR' },
                { label: 'Germany', value: 'DE' },
                { label: 'Other', value: 'OTHER' },
              ],
            },
            {
              name: 'baseCurrency',
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
              name: 'websiteUrl',
              type: 'text',
              admin: {
                placeholder: 'https://example.com',
              },
            },
            {
              name: 'instagramHandle',
              type: 'text',
              admin: {
                placeholder: '@brandname',
              },
            },
            {
              name: 'otherSocials',
              type: 'array',
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  options: [
                    { label: 'Twitter', value: 'twitter' },
                    { label: 'TikTok', value: 'tiktok' },
                    { label: 'Pinterest', value: 'pinterest' },
                  ],
                },
                {
                  name: 'url',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Status & Admin',
          fields: [
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'pending',
              options: [
                { label: 'Pending Review', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
                { label: 'Suspended', value: 'suspended' },
              ],
              admin: {
                description: 'Brand approval status',
              },
              access: {
                update: isAdminFieldLevel,
              },
            },
            {
              name: 'internalNotes',
              type: 'richText',
              admin: {
                description: 'Internal notes for admin team only',
              },
              access: {
                read: isAdminFieldLevel,
                update: isAdminFieldLevel,
              },
            },
            {
              name: 'reviewedBy',
              type: 'relationship',
              relationTo: 'users',
              access: {
                read: isAdminFieldLevel,
                update: isAdminFieldLevel,
              },
            },
            {
              name: 'reviewedAt',
              type: 'date',
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
              access: {
                read: isAdminFieldLevel,
                update: isAdminFieldLevel,
              },
            },
          ],
        },
        {
          label: 'Stripe & Payouts',
          fields: [
            {
              name: 'stripeConnectAccountId',
              type: 'text',
              admin: {
                description: 'Stripe Connect account ID',
                readOnly: true,
              },
              access: {
                read: ({ req: { user } }) =>
                  user?.role === 'admin' || user?.role === 'support',
                update: isAdminFieldLevel,
              },
            },
            {
              name: 'stripeOnboardingStatus',
              type: 'select',
              defaultValue: 'not_started',
              options: [
                { label: 'Not Started', value: 'not_started' },
                { label: 'In Progress', value: 'in_progress' },
                { label: 'Complete', value: 'complete' },
              ],
              access: {
                update: isAdminFieldLevel,
              },
            },
            {
              name: 'defaultPlatformFeePercent',
              type: 'number',
              min: 0,
              max: 100,
              admin: {
                description: 'Override platform fee for this brand (optional)',
              },
              access: {
                update: isAdminFieldLevel,
              },
            },
          ],
        },
      ],
    },
  ],
}
