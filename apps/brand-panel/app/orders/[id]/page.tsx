'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/AuthContext'
import { Order, OrderItem } from '@/lib/types/payload'
import { PanelLayout } from '@/components/layout/PanelLayout'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { brand } = useAuth()
  const orderId = params?.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return

      setIsLoading(true)
      setError(null)

      try {
        // Fetch order with depth to populate relationships
        const orderData = await apiClient.findByID<Order>('orders', orderId, 2)
        setOrder(orderData)

        // Fetch order items for this order
        const itemsResponse = await apiClient.find<OrderItem>('orderItems', {
          where: { order: { equals: orderId } },
          depth: 2,
        })
        setOrderItems(itemsResponse.docs)
      } catch (err: any) {
        setError(err.message || 'Failed to load order')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  const handleMarkAsFulfilled = async () => {
    if (!order?.id) return

    if (!confirm('Mark this order as fulfilled? The customer will be notified.')) {
      return
    }

    setIsUpdating(true)

    try {
      const updated = await apiClient.update<Order>('orders', order.id, {
        status: 'fulfilled',
        fulfilledAt: new Date().toISOString(),
      })
      setOrder(updated)
    } catch (err: any) {
      alert(err.message || 'Failed to update order')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = async () => {
    if (!order?.id) return

    const reason = prompt('Why is this order being cancelled?')
    if (!reason) return

    setIsUpdating(true)

    try {
      const updated = await apiClient.update<Order>('orders', order.id, {
        status: 'cancelled',
        internalNotes: `${order.internalNotes || ''}\n\nCancelled: ${reason}`.trim(),
      })
      setOrder(updated)
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <PanelLayout>
        <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-panelWhite border-t-transparent" />
          <p className="text-sm text-panelGray">Loading order...</p>
        </div>
      </div>
      </PanelLayout>
    )
  }

  if (error || !order) {
    return (
      <PanelLayout>
        <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="h2 mb-2">Order not found</h1>
          <p className="mb-4 text-panelGray">{error || 'This order does not exist'}</p>
          <Link href="/orders" className="btn-primary inline-block">
            Back to orders
          </Link>
        </div>
      </div>
      </PanelLayout>
    )
  }

  const currency = brand?.baseCurrency || 'GBP'
  const currencySymbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', className: 'border border-panelGray text-panelGray' }
      case 'paid':
        return { label: 'Paid', className: 'border border-panelWhite text-panelWhite' }
      case 'fulfilled':
        return { label: 'Fulfilled', className: 'bg-panelWhite text-panelBlack' }
      case 'cancelled':
        return { label: 'Cancelled', className: 'border border-red-500 text-red-500' }
      case 'refunded':
        return { label: 'Refunded', className: 'border border-red-500 text-red-500' }
      default:
        return { label: status, className: 'border border-panelGray text-panelGray' }
    }
  }

  const statusBadge = getStatusBadge(order.status)

  return (
    <PanelLayout>
      <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/orders" className="mb-2 text-sm text-panelGray hover:text-panelWhite">
            ← Back to orders
          </Link>
          <h1 className="h2">Order #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-panelGray">
            Placed {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Actions */}
      {order.status === 'paid' && (
        <div className="card bg-panelSoftGray/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="h4">Action needed</h3>
              <p className="mt-1 text-sm text-panelGray">
                This order has been paid. Mark it as fulfilled once you've shipped it.
              </p>
            </div>
            <button
              onClick={handleMarkAsFulfilled}
              className="btn-primary"
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Mark as fulfilled'}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="card">
            <h3 className="h4 mb-4">Items ({orderItems.length})</h3>
            <div className="space-y-3">
              {orderItems.map((item) => {
                const product = typeof item.product === 'object' ? item.product : null
                const primaryImage = product?.primaryImage && typeof product.primaryImage === 'object'
                  ? product.primaryImage
                  : null

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border border-panelSoftGray p-3"
                  >
                    {/* Product Image */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-panelSoftGray">
                      {primaryImage ? (
                        <img
                          src={primaryImage.sizes?.thumbnail?.url || primaryImage.url}
                          alt={item.productTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <svg
                            className="h-6 w-6 text-panelGray"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productTitle}</h4>
                      {item.variantSummary && (
                        <p className="text-sm text-panelGray">{item.variantSummary}</p>
                      )}
                      <p className="mt-1 text-sm text-panelGray">Qty: {item.quantity}</p>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-medium">
                        {currencySymbol}
                        {item.subtotal.toFixed(2)}
                      </p>
                      <p className="text-xs text-panelGray">
                        {currencySymbol}
                        {item.unitPrice.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Order Totals */}
            <div className="mt-4 space-y-2 border-t border-panelSoftGray pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-panelGray">Subtotal</span>
                <span>
                  {currencySymbol}
                  {order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-panelGray">Shipping</span>
                <span>
                  {currencySymbol}
                  {order.shipping.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-panelGray">Tax</span>
                <span>
                  {currencySymbol}
                  {order.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-panelSoftGray pt-2 font-medium">
                <span>Total</span>
                <span>
                  {currencySymbol}
                  {order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.buyerNote && (
            <div className="card">
              <h3 className="h4 mb-2">Buyer's note</h3>
              <p className="text-sm text-panelGray">{order.buyerNote}</p>
            </div>
          )}

          {order.internalNotes && (
            <div className="card">
              <h3 className="h4 mb-2">Internal notes</h3>
              <p className="whitespace-pre-wrap text-sm text-panelGray">{order.internalNotes}</p>
            </div>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="card">
            <h3 className="h4 mb-4">Customer</h3>
            {order.shippingAddress ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                </div>
                <div className="border-t border-panelSoftGray pt-3">
                  <p className="label mb-1">Shipping address</p>
                  <div className="text-panelGray">
                    {order.shippingAddress.line1 && <p>{order.shippingAddress.line1}</p>}
                    {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                    {order.shippingAddress.city && <p>{order.shippingAddress.city}</p>}
                    {order.shippingAddress.state && <p>{order.shippingAddress.state}</p>}
                    {order.shippingAddress.postalCode && <p>{order.shippingAddress.postalCode}</p>}
                    {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-panelGray">No shipping address</p>
            )}
          </div>

          {/* Timeline */}
          <div className="card">
            <h3 className="h4 mb-4">Timeline</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-panelSoftGray">
                  <div className="h-2 w-2 rounded-full bg-panelWhite" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Order placed</p>
                  <p className="text-xs text-panelGray">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {order.paidAt && (
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-panelSoftGray">
                    <div className="h-2 w-2 rounded-full bg-panelWhite" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Payment received</p>
                    <p className="text-xs text-panelGray">
                      {new Date(order.paidAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {order.fulfilledAt && (
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-panelWhite">
                    <svg className="h-4 w-4 text-panelBlack" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Order fulfilled</p>
                    <p className="text-xs text-panelGray">
                      {new Date(order.fulfilledAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {order.status !== 'cancelled' && order.status !== 'refunded' && (
            <div className="card">
              <h3 className="h4 mb-4">Actions</h3>
              <button
                onClick={handleCancel}
                className="btn-secondary w-full"
                disabled={isUpdating}
              >
                Cancel order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </PanelLayout>
  )
}
