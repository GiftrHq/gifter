import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-08-01',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
export const stripeWebhookHandler = async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'] as string

  let event: Stripe.Event

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  // Handle the event
  switch (event.type) {
    case 'account.updated': {
      const account = event.data.object as Stripe.Account
      await handleAccountUpdated(req.payload, account)
      break
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentIntentSucceeded(req.payload, paymentIntent)
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      await handleChargeRefunded(req.payload, charge)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return res.json({ received: true })
}

/**
 * Handle account.updated event - update brand onboarding status
 */
async function handleAccountUpdated(payload: any, account: Stripe.Account) {
  try {
    // Find brand by stripeConnectAccountId
    const brands = await payload.find({
      collection: 'brands',
      where: {
        stripeConnectAccountId: {
          equals: account.id,
        },
      },
      limit: 1,
    })

    if (brands.docs.length === 0) {
      console.log(`No brand found for Stripe account: ${account.id}`)
      return
    }

    const brand = brands.docs[0]

    // Check if onboarding is complete
    const isOnboardingComplete =
      account.charges_enabled &&
      account.payouts_enabled &&
      account.details_submitted

    if (isOnboardingComplete && brand.stripeOnboardingStatus !== 'complete') {
      await payload.update({
        collection: 'brands',
        id: brand.id,
        data: {
          stripeOnboardingStatus: 'complete',
        },
      })
      console.log(`✅ Brand ${brand.name} Stripe onboarding marked complete`)
    } else if (!isOnboardingComplete && brand.stripeOnboardingStatus === 'not_started') {
      await payload.update({
        collection: 'brands',
        id: brand.id,
        data: {
          stripeOnboardingStatus: 'in_progress',
        },
      })
    }
  } catch (error) {
    console.error('Error handling account.updated:', error)
  }
}

/**
 * Handle payment_intent.succeeded - mark order as paid
 */
async function handlePaymentIntentSucceeded(payload: any, paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find order by stripePaymentIntentId
    const orders = await payload.find({
      collection: 'orders',
      where: {
        stripePaymentIntentId: {
          equals: paymentIntent.id,
        },
      },
      limit: 1,
    })

    if (orders.docs.length === 0) {
      console.log(`No order found for PaymentIntent: ${paymentIntent.id}`)
      return
    }

    const order = orders.docs[0]

    if (order.status !== 'paid') {
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: {
          status: 'paid',
          paidAt: new Date().toISOString(),
        },
      })
      console.log(`✅ Order ${order.orderNumber} marked as paid`)

      // Create payout record
      await payload.create({
        collection: 'payouts',
        data: {
          brand: order.brand,
          order: order.id,
          type: 'payout',
          amount: order.total,
          currency: order.currency,
          description: `Order #${order.orderNumber}`,
        },
      })
    }
  } catch (error) {
    console.error('Error handling payment_intent.succeeded:', error)
  }
}

/**
 * Handle charge.refunded - mark order as refunded
 */
async function handleChargeRefunded(payload: any, charge: Stripe.Charge) {
  try {
    // Find order by stripeChargeId
    const orders = await payload.find({
      collection: 'orders',
      where: {
        stripeChargeId: {
          equals: charge.id,
        },
      },
      limit: 1,
    })

    if (orders.docs.length === 0) {
      console.log(`No order found for Charge: ${charge.id}`)
      return
    }

    const order = orders.docs[0]

    await payload.update({
      collection: 'orders',
      id: order.id,
      data: {
        status: 'refunded',
      },
    })
    console.log(`✅ Order ${order.orderNumber} marked as refunded`)

    // Create refund record in payouts
    await payload.create({
      collection: 'payouts',
      data: {
        brand: order.brand,
        order: order.id,
        type: 'refund',
        amount: -((charge.amount_refunded || 0) / 100), // Convert from cents
        currency: order.currency,
        description: `Refund for Order #${order.orderNumber}`,
      },
    })
  } catch (error) {
    console.error('Error handling charge.refunded:', error)
  }
}

/**
 * Helper to get raw body from request
 */
async function getRawBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk: any) => {
      data += chunk
    })
    req.on('end', () => {
      resolve(data)
    })
    req.on('error', reject)
  })
}
