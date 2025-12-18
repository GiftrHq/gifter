'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { apiClient } from '@/lib/api/client'
import { Order, Product } from '@/lib/types/payload'
import { PanelLayout } from '@/components/layout/PanelLayout'

interface DashboardMetrics {
  totalOrders: number
  totalRevenue: number
  paidOrders: number
  fulfilledOrders: number
  topProduct?: {
    id: string
    title: string
    orderCount: number
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, brand } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [productCount, setProductCount] = useState(0)
  const [publishedProductCount, setPublishedProductCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!brand?.id) return

      setIsLoading(true)

      try {
        // Fetch orders
        const ordersResponse = await apiClient.find<Order>('orders', {
          where: { brand: { equals: brand.id } },
          sort: '-createdAt',
          limit: 100,
          depth: 2,
        })

        const orders = ordersResponse.docs

        // Calculate metrics
        const totalOrders = orders.length
        const totalRevenue = orders
          .filter((o) => o.status === 'paid' || o.status === 'fulfilled')
          .reduce((sum, o) => sum + o.total, 0)
        const paidOrders = orders.filter((o) => o.status === 'paid').length
        const fulfilledOrders = orders.filter((o) => o.status === 'fulfilled').length

        // Find top product
        const productOrderCounts: Record<string, { title: string; count: number }> = {}

        for (const order of orders) {
          // Would need to fetch order items to get products
          // For now, we'll skip this complex calculation
        }

        setMetrics({
          totalOrders,
          totalRevenue,
          paidOrders,
          fulfilledOrders,
        })

        // Set recent orders (top 4)
        setRecentOrders(orders.slice(0, 4))

        // Fetch product counts
        const productsResponse = await apiClient.find<Product>('products', {
          where: { brand: { equals: brand.id } },
          limit: 1,
        })
        setProductCount(productsResponse.totalDocs)

        const publishedResponse = await apiClient.find<Product>('products', {
          where: {
            brand: { equals: brand.id },
            status: { equals: 'published' },
          },
          limit: 1,
        })
        setPublishedProductCount(publishedResponse.totalDocs)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
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

  const needsStripeSetup = brand?.stripeOnboardingStatus !== 'complete'
  const currency = brand?.baseCurrency || 'GBP'
  const currencySymbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'

  const getOrderStatusDisplay = (status: string) => {
    switch (status) {
      case 'paid':
        return { label: 'Paid', className: 'border border-panelWhite text-panelWhite' }
      case 'fulfilled':
        return { label: 'Fulfilled', className: 'bg-panelWhite text-panelBlack' }
      case 'pending':
        return { label: 'Pending', className: 'border border-panelGray text-panelGray' }
      case 'cancelled':
        return { label: 'Cancelled', className: 'border border-red-500 text-red-500' }
      case 'refunded':
        return { label: 'Refunded', className: 'border border-red-500 text-red-500' }
      default:
        return { label: status, className: 'border border-panelGray text-panelGray' }
    }
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    return '??'
  }

  return (
    <PanelLayout>
      <div className="max-w-7xl space-y-8">
      {/* Welcome Strip */}
      <div className="animate-fade-in-up space-y-2">
        <h1 className="h1">Hello, {brand?.name || 'there'}.</h1>
        <p className="text-panelGray">I've pulled together your latest gifting activity.</p>
      </div>

      {/* Two Column Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="card">
            <div className="mb-4">
              <h2 className="h4 mb-2">Your status</h2>

              {brand?.status === 'pending' && (
                <div>
                  <span className="inline-block rounded-full bg-panelSoftGray px-3 py-1 text-xs">
                    Pending review
                  </span>
                  <p className="mt-3 text-sm text-panelGray">
                    I'm reviewing your application. You'll hear from me soon.
                  </p>
                </div>
              )}

              {brand?.status === 'approved' && needsStripeSetup && (
                <div>
                  <span className="inline-block rounded-full bg-panelWhite px-3 py-1 text-xs text-panelBlack">
                    Action needed
                  </span>
                  <p className="mt-3 text-sm text-panelGray">
                    You're approved. Next we just need your payout details.
                  </p>
                  <button
                    onClick={handleStripeOnboarding}
                    className="btn-primary mt-4"
                    disabled={isOnboardingLoading}
                  >
                    {isOnboardingLoading ? 'Loading...' : 'Complete payout setup'}
                  </button>
                </div>
              )}

              {brand?.status === 'approved' && !needsStripeSetup && (
                <div>
                  <span className="inline-block rounded-full bg-panelWhite px-3 py-1 text-xs text-panelBlack">
                    Active
                  </span>
                  <p className="mt-3 text-sm text-panelGray">
                    You're all set. Products are live in Gifter.
                  </p>
                </div>
              )}

              {brand?.status === 'rejected' && (
                <div>
                  <span className="inline-block rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-500">
                    Application rejected
                  </span>
                  <p className="mt-3 text-sm text-panelGray">
                    Unfortunately, your application wasn't approved at this time.
                  </p>
                </div>
              )}

              {brand?.status === 'suspended' && (
                <div>
                  <span className="inline-block rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-500">
                    Account suspended
                  </span>
                  <p className="mt-3 text-sm text-panelGray">
                    Your account has been suspended. Please contact support.
                  </p>
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="mt-6 space-y-3 border-t border-panelSoftGray pt-4">
              <ChecklistItem completed={brand?.status === 'approved'} text="Brand approved" />
              <ChecklistItem completed={publishedProductCount > 0} text="First products added" />
              <ChecklistItem completed={!needsStripeSetup} text="Payouts configured" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="card">
            <h2 className="h4 mb-4">At a glance</h2>

            {isLoading ? (
              <div className="py-8 text-center">
                <div className="mb-2 inline-block h-6 w-6 animate-spin rounded-full border-2 border-panelWhite border-t-transparent" />
                <p className="text-xs text-panelGray">Loading metrics...</p>
              </div>
            ) : metrics ? (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="label">Orders</p>
                    <p className="text-2xl font-light">{metrics.totalOrders}</p>
                  </div>
                  <div>
                    <p className="label">Revenue</p>
                    <p className="text-2xl font-light">
                      {currencySymbol}
                      {metrics.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="label">Products</p>
                    <p className="text-2xl font-light">{productCount}</p>
                    <p className="text-xs text-panelGray">
                      {publishedProductCount} published
                    </p>
                  </div>
                  <div>
                    <p className="label">Fulfilled</p>
                    <p className="text-2xl font-light">{metrics.fulfilledOrders}</p>
                  </div>
                </div>

                <p className="mt-4 text-xs text-panelGray">
                  I'll keep this simple. If something spikes or dips, I'll let you know.
                </p>
              </div>
            ) : null}
          </div>

          {/* Recent Orders */}
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="h4">Recent orders</h2>
              <Link href="/orders" className="text-xs text-panelGray hover:text-panelWhite">
                View all orders →
              </Link>
            </div>

            {isLoading ? (
              <div className="py-8 text-center">
                <div className="mb-2 inline-block h-6 w-6 animate-spin rounded-full border-2 border-panelWhite border-t-transparent" />
                <p className="text-xs text-panelGray">Loading orders...</p>
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.map((order) => {
                  const status = getOrderStatusDisplay(order.status)
                  const shippingAddress = order.shippingAddress
                  const initials = getInitials(
                    shippingAddress?.firstName,
                    shippingAddress?.lastName
                  )

                  return (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-center justify-between rounded-lg bg-panelBlack p-3 text-sm hover:bg-panelSoftGray"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-panelSoftGray text-xs">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <p className="text-xs text-panelGray">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-medium">
                          {currencySymbol}
                          {order.total.toFixed(2)}
                        </p>
                        <span className={`rounded-full px-2 py-1 text-xs ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <svg
                  className="mx-auto mb-2 h-8 w-8 text-panelGray"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <p className="text-xs text-panelGray">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </PanelLayout>
  )
}

function ChecklistItem({ completed, text }: { completed: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-4 w-4 rounded-full border-2 ${
          completed ? 'border-panelWhite bg-panelWhite' : 'border-panelGray'
        }`}
      >
        {completed && (
          <svg className="h-full w-full text-panelBlack" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
          </svg>
        )}
      </div>
      <p className={`text-sm ${completed ? 'text-panelWhite' : 'text-panelGray'}`}>{text}</p>
    </div>
  )
}
