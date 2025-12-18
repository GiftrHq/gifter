import type { CollectionConfig } from 'payload'
import { isBrandUser } from '../access/isBrandUser.js'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 400,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 768,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  admin: {
    group: 'Commerce',
  },
  access: {
    create: isBrandUser,
    read: () => true, // Public read for product images
    update: isBrandUser,
    delete: isBrandUser,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
  ],
}
