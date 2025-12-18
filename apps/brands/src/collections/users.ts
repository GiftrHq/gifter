import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin.js'
import { isAdminOrSelf } from '../access/isAdminOrSelf.js'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'brand'],
    group: 'System',
  },
  access: {
    // Allow public signup for brand users
    create: ({ req: { user }, data }) => {
      // Allow if creating brandOwner/brandStaff (signup flow)
      if (!user && data?.role && ['brandOwner', 'brandStaff'].includes(data.role)) {
        return true
      }
      // Admins can create any user
      if (user?.role === 'admin') return true
      return false
    },
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: () => true, // Allow all authenticated users to access admin
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'brandOwner',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Brand Owner', value: 'brandOwner' },
        { label: 'Brand Staff', value: 'brandStaff' },
        { label: 'Support', value: 'support' },
      ],
      admin: {
        description: 'User role determines access level',
      },
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      required: false,
      admin: {
        condition: (data) =>
          data?.role === 'brandOwner' || data?.role === 'brandStaff',
        description: 'The brand this user belongs to (required for brand users)',
      },
      // Validate that brand users have a brand
      validate: (value: any, { data }: any) => {
        if (
          (data?.role === 'brandOwner' || data?.role === 'brandStaff') &&
          !value
        ) {
          return 'Brand is required for brand users'
        }
        return true
      },
    },
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
  ],
}
