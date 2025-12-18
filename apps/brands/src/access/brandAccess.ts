import type { Access, Where } from 'payload'

/**
 * Ensures brand users can only access their own brand's data
 */
export const filterByBrand: Access = ({ req: { user } }) => {
  if (!user) return false

  // Admins can see everything
  if (user.role === 'admin' || user.role === 'support') {
    return true
  }

  // Brand users can only see their own brand
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
}

/**
 * Generic access control for collections that belong to a brand
 * @param brandFieldPath - The path to the brand relationship field (e.g., 'brand' or 'product.brand')
 */
export const filterByBrandField = (brandFieldPath: string = 'brand'): Access => {
  return ({ req: { user } }) => {
    if (!user) return false

    // Admins can see everything
    if (user.role === 'admin' || user.role === 'support') {
      return true
    }

    // Brand users can only see data belonging to their brand
    if (user.role === 'brandOwner' || user.role === 'brandStaff') {
      if (!user.brand) return false

      // Extract brand ID - handle both number ID and populated object
      const brandId = typeof user.brand === 'number' ? user.brand : (user.brand as any)?.id

      const constraint: Where = {}
      const fields = brandFieldPath.split('.')
      let current: any = constraint

      for (let i = 0; i < fields.length; i++) {
        if (i === fields.length - 1) {
          current[fields[i]] = {
            equals: brandId,
          }
        } else {
          current[fields[i]] = {}
          current = current[fields[i]]
        }
      }

      return constraint
    }

    return false
  }
}
