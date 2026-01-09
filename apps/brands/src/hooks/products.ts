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

      // Fetch variants if product has them
      let variants = []
      if (doc.hasVariants) {
        const variantsResult = await req.payload.find({
          collection: 'productVariants',
          where: {
            product: {
              equals: doc.id,
            },
          },
        })
        variants = variantsResult.docs.map((v) => ({
          payloadVariantId: v.id,
          sku: v.sku,
          optionValues: v.optionValues || [],
          price: v.price,
          currency: v.currency,
          stock: v.stock,
          stripePriceId: v.stripePriceId,
        }))
      }

      // Get image URLs
      let primaryImageUrl = null
      if (doc.primaryImage && typeof doc.primaryImage === 'object') {
        primaryImageUrl = doc.primaryImage.url
      }

      const galleryImageUrls = (doc.gallery || [])
        .filter((item) => item?.image && typeof item.image === 'object')
        .map((item) => (item.image as any).url)

      const payload = {
        event: 'product.changed',
        payloadProductId: doc.id.toString(),
        brand: {
          payloadBrandId: brand.id.toString(),
          name: brand.name,
          status: brand.status,
          country: brand.country,
          baseCurrency: brand.baseCurrency,
          logoUrl: brand.logo && typeof brand.logo === 'object' ? brand.logo.url : null,
          coverImageUrl: brand.coverImage && typeof brand.coverImage === 'object' ? brand.coverImage.url : null,
        },
        product: {
          title: doc.title,
          slug: doc.slug,
          status: doc.status,
          visibleToGifter: true,
          isFeatured: doc.isFeatured || false,
          shortDescription: doc.shortDescription,
          description: doc.description,
          specs: doc.specs,
          primaryImageUrl,
          galleryImageUrls,
          defaultPrice: doc.defaultPrice,
          defaultCurrency: doc.defaultCurrency,
          giftTags: doc.giftTags || [],
          occasionFit: doc.occasionFit || [],
          styleTags: doc.styleTags || [],
        },
        variants,
        ts: new Date().toISOString(),
      }

      // Send to Core API
      const response = await fetch(`${coreApiUrl}/v1/integrations/payload/product-changed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Webhook-Secret': coreApiSecret,
          'X-Event-Name': 'product.changed',
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
