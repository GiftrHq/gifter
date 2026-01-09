import type { CollectionAfterChangeHook } from 'payload'

/**
 * Hook: Notify Core API when an order is paid or refunded
 */
export const notifyCoreApiOnOrderStatusChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  const coreApiUrl = process.env.CORE_API_URL
  const coreApiSecret = process.env.CORE_API_SECRET

  if (!coreApiUrl || !coreApiSecret) {
    console.warn('Core API URL or secret not configured, skipping webhook')
    return doc
  }

  // Check if status changed to paid or refunded
  const statusChanged = previousDoc?.status !== doc.status
  const isPaid = doc.status === 'paid'
  const isRefunded = doc.status === 'refunded'

  if (statusChanged && (isPaid || isRefunded)) {
    try {
      // Fetch order items to get product details
      const orderItems = await req.payload.find({
        collection: 'orderItems',
        where: {
          order: {
            equals: doc.id,
          },
        },
      })

      const payload = {
        event: isPaid ? 'order.paid' : 'order.refunded',
        orderId: doc.id.toString(),
        order: {
          id: doc.id,
          orderNumber: doc.orderNumber,
          coreUserId: doc.coreUserId,
          coreOccasionId: doc.coreOccasionId,
          total: doc.total,
          currency: doc.currency,
          paidAt: doc.paidAt,
          items: orderItems.docs.map((item) => ({
            productId: typeof item.product === 'number' ? item.product : (item.product as any)?.id,
            productTitle: item.productTitle,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      }

      // Send to Core API
      const response = await fetch(`${coreApiUrl}/v1/integrations/payload/order-status-changed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Webhook-Secret': coreApiSecret,
          'X-Event-Name': 'order.status_changed',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error(`Failed to sync order to Core API: ${response.statusText}`)
      } else {
        console.log(`✅ Synced order to Core API: ${doc.orderNumber}`)
      }
    } catch (error) {
      console.error('Error notifying Core API:', error)
    }
  }

  return doc
}
