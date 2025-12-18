import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-08-01',
})

/**
 * POST /api/brands/:id/stripe/onboard
 * Generate a Stripe Connect onboarding link for a brand
 */
export const generateOnboardingLink = async (req: any, res: any) => {
  try {
    const { user } = req
    const brandId = req.params.id

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Fetch the brand
    const brand = await req.payload.findByID({
      collection: 'brands',
      id: brandId,
    })

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' })
    }

    // Check access: user must be admin or belong to this brand
    const hasAccess =
      user.role === 'admin' ||
      user.role === 'support' ||
      (user.brand && user.brand.toString() === brandId)

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Brand must have a Stripe Connect account
    if (!brand.stripeConnectAccountId) {
      return res.status(400).json({ error: 'No Stripe Connect account for this brand' })
    }

    // Get settings for return/refresh URLs
    const settings = await req.payload.findGlobal({
      slug: 'commerceSettings',
    })

    const returnUrl = settings.returnUrlBase || `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/settings/payouts/success`
    const refreshUrl = settings.refreshUrlBase || `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/settings/payouts`

    // Create account link
    const accountLink = await stripe.accountLinks.create({
      account: brand.stripeConnectAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    // Update brand status to in_progress
    await req.payload.update({
      collection: 'brands',
      id: brandId,
      data: {
        stripeOnboardingStatus: 'in_progress',
      },
    })

    return res.json({
      url: accountLink.url,
    })
  } catch (error) {
    console.error('Error generating onboarding link:', error)
    return res.status(500).json({ error: 'Failed to generate onboarding link' })
  }
}
