import type { Access } from 'payload'

export const isBrandUser: Access = ({ req: { user } }) => {
  return Boolean(
    user &&
      (user.role === 'admin' ||
        user.role === 'brandOwner' ||
        user.role === 'brandStaff')
  )
}
