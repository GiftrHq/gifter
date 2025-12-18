'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { apiClient } from '@/lib/api/client'
import { Payout } from '@/lib/types/payload'
import { PanelLayout } from '@/components/layout/PanelLayout'

export default function PayoutsPage() {
  const { brand } = useAuth()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPayouts = async () => {
      if (!brand?.id) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.find<Payout>('payouts', {
          where: { brand: { equals: brand.id } },
          sort: '-createdAt',
          limit: 50,
        })

        setPayouts(response.docs)
      } catch (err: any) {
        setError(err.message || 'Failed to load payouts')
      } finally {
        setIsLoading(false)
      }
    }

    loadPayouts()
  }, [brand?.id])

  const handleStripeOnboarding = async () => {
    if (!brand?.id) return

    setIsOnboardingLoading(true)

    try {
      const { url } = await apiClient.getStripeOnboardingLink(brand.id)
      window.location.href = url
    } catch (err: any) {
      alert(err.message || 'Failed to start Stripe onboarding')
    } finally {
      setIsOnboardingLoading(false)
    }
  }

  const stripeOnboardingStatus = brand?.stripeOnboardingStatus || 'not_started'
  const currency = brand?.baseCurrency || 'GBP'
  const currencySymbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'

  const getPayoutTypeLabel = (type: string) => {
    switch (type) {
      case 'payout':
        return 'Payout'
      case 'platformFee':
        return 'Platform Fee'
      case 'refund':
        return 'Refund'
      case 'adjustment':
        return 'Adjustment'
      default:
        return type
    }
  }

  const getPayoutTypeColor = (type: string) => {
    switch (type) {
      case 'payout':
        return 'text-green-500'
      case 'platformFee':
        return 'text-panelGray'
      case 'refund':
        return 'text-red-500'
      case 'adjustment':
        return 'text-panelGray'
      default:
        return 'text-panelGray'
    }
  }

  return (
    <PanelLayout>
      <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="h1">Payouts</h1>
        <p className="text-panelGray">Manage your Stripe payouts and transaction history.</p>
      </div>

      {/* Stripe Onboarding Card */}
      <div className="card">
        {stripeOnboardingStatus === 'not_started' && (
          <>
            <h2 className="h3 mb-3">Set up payouts</h2>
            <p className="mb-6 text-panelGray">
              I'll need a few details so Stripe can send funds to you. This only takes a few
              minutes.
            </p>
            <button
              onClick={handleStripeOnboarding}
              className="btn-primary"
              disabled={isOnboardingLoading}
            >
              {isOnboardingLoading ? 'Loading...' : 'Start Stripe setup'}
            </button>
          </>
        )}

        {stripeOnboardingStatus === 'in_progress' && (
          <>
            <h2 className="h3 mb-3">Finish your payout setup</h2>
            <p className="mb-6 text-panelGray">
              You started setting things up with Stripe. When you're ready, you can pick up where
              you left off.
            </p>
            <button
              onClick={handleStripeOnboarding}
              className="btn-primary"
              disabled={isOnboardingLoading}
            >
              {isOnboardingLoading ? 'Loading...' : 'Resume setup'}
            </button>
          </>
        )}

        {stripeOnboardingStatus === 'complete' && (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="h3 mb-3">Payouts are ready</h2>
                <p className="text-panelGray">
                  You're all set. Future orders will be paid out to your Stripe account.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <svg
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            {brand?.stripeConnectAccountId && (
              <p className="mt-4 text-xs text-panelGray">
                Account ID: {brand.stripeConnectAccountId}
              </p>
            )}
          </>
        )}
      </div>

      {/* Payout History */}
      {stripeOnboardingStatus === 'complete' && (
        <div className="card">
          <h2 className="h4 mb-4">Transaction history</h2>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="py-8 text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-panelWhite border-t-transparent" />
              <p className="text-sm text-panelGray">Loading transactions...</p>
            </div>
          ) : payouts.length === 0 ? (
            <div className="py-8 text-center">
              <svg
                className="mx-auto mb-4 h-12 w-12 text-panelGray"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <p className="text-sm text-panelGray">
                No transactions yet. They'll appear here once orders are processed.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between rounded-lg border border-panelSoftGray p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${getPayoutTypeColor(payout.type)}`}>
                        {getPayoutTypeLabel(payout.type)}
                      </span>
                      {payout.description && (
                        <>
                          <span className="text-panelGray">•</span>
                          <span className="text-sm text-panelGray">{payout.description}</span>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-panelGray">
                      {new Date(payout.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        payout.type === 'payout'
                          ? 'text-green-500'
                          : payout.type === 'refund' || payout.type === 'platformFee'
                            ? 'text-red-500'
                            : ''
                      }`}
                    >
                      {payout.type === 'payout' ? '+' : '-'}
                      {currencySymbol}
                      {Math.abs(payout.amount).toFixed(2)}
                    </p>
                    {payout.stripeTransferId && (
                      <p className="mt-1 text-xs text-panelGray">{payout.stripeTransferId}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info Card */}
      <div className="card bg-panelSoftGray/20">
        <h3 className="h4 mb-2">How payouts work</h3>
        <ul className="space-y-2 text-sm text-panelGray">
          <li className="flex gap-2">
            <span className="text-panelWhite">•</span>
            <span>Funds from orders are automatically transferred to your Stripe account</span>
          </li>
          <li className="flex gap-2">
            <span className="text-panelWhite">•</span>
            <span>Gifter takes a small platform fee from each transaction</span>
          </li>
          <li className="flex gap-2">
            <span className="text-panelWhite">•</span>
            <span>You can view detailed transaction history in your Stripe dashboard</span>
          </li>
        </ul>
      </div>
    </div>
    </PanelLayout>
  )
}
