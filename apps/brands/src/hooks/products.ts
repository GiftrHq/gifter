import type { CollectionAfterChangeHook } from 'payload'

/**
 * Hook: Notify Core API when a product is published or archived
 */
export const notifyCoreApiOnProductChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const coreApiUrl = process.env.CORE_API_URL
  const coreApiSecret = process.env.CORE_API_SECRET

  if (!coreApiUrl || !coreApiSecret) {
    console.warn('Core API URL or secret not configured, skipping webhook')
    return doc
  }

  // Check if status changed to published or archived
  const statusChanged = previousDoc?.status !== doc.status
  const isPublished = doc.status === 'published'
  const isArchived = doc.status === 'archived'

  if (statusChanged && (isPublished || isArchived)) {
    try {
      // Fetch related brand data
      let brand = doc.brand
      if (typeof brand === 'string') {
        brand = await req.payload.findByID({
          collection: 'brands',
          id: brand,
        })
      }

      // Only sync if brand is approved
      if (brand.status !== 'approved') {
        console.log(`Skipping product sync - brand not approved: ${doc.title}`)
        return doc
      }

      const payload = {
        event: isPublished ? 'product.published' : 'product.archived',
        productId: doc.id,
        product: {
          id: doc.id,
          title: doc.title,
          slug: doc.slug,
          shortDescription: doc.shortDescription,
          brandId: brand.id,
          brandName: brand.name,
          primaryImage: doc.primaryImage,
          gallery: doc.gallery,
          giftTags: doc.giftTags,
          occasionFit: doc.occasionFit,
          styleTags: doc.styleTags,
          defaultPrice: doc.defaultPrice,
          defaultCurrency: doc.defaultCurrency,
          hasVariants: doc.hasVariants,
        },
      }

      // Send to Core API
      const response = await fetch(`${coreApiUrl}/internal/commerce/product-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${coreApiSecret}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error(`Failed to sync product to Core API: ${response.statusText}`)
      } else {
        console.log(`✅ Synced product to Core API: ${doc.title}`)
      }
    } catch (error) {
      console.error('Error notifying Core API:', error)
    }
  }

  return doc
}
