import type { Access } from 'payload'

export const isAdminOrSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false

  if (user.role === 'admin') return true

  // User can access their own record
  return user.id === id
}
