import type { Access, FieldAccess } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => {
  return user?.role === 'admin'
}
