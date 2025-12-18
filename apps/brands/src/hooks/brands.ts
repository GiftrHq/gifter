import type { CollectionAfterChangeHook } from 'payload'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-08-01',
})

/**
 * Hook: After brand status changes to 'approved', create a Stripe Connect account
 */
export const createStripeConnectAccount: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
}) => {
  // Only run on update when status changes to approved
  if (operation !== 'update') return doc

  const statusChanged = previousDoc?.status !== doc.status
  const nowApproved = doc.status === 'approved'
  const noStripeAccount = !doc.stripeConnectAccountId

  if (statusChanged && nowApproved && noStripeAccount) {
    try {
      // Create Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: doc.country || 'GB',
        email: doc.email, // If you have brand email
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: doc.name,
          url: doc.websiteUrl,
        },
      })

      console.log(`✅ Created Stripe Connect account for brand: ${doc.name}`)

      // Update the brand with the Stripe account ID
      // Note: This should be done via the API to avoid infinite loops
      return {
        ...doc,
        stripeConnectAccountId: account.id,
        stripeOnboardingStatus: 'not_started',
      }
    } catch (error) {
      console.error('Failed to create Stripe Connect account:', error)
      // Don't fail the whole operation, just log it
      return doc
    }
  }

  return doc
}
