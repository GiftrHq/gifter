'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'
import { apiClient } from '@/lib/api/client'
import { Order } from '@/lib/types/payload'
import { PanelLayout } from '@/components/layout/PanelLayout'

type FilterStatus = 'all' | 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded'

export default function OrdersPage() {
  const { brand } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadOrders = async () => {
      if (!brand?.id) return

      setIsLoading(true)
      setError(null)

      try {
        const where: any = { brand: { equals: brand.id } }

        if (filterStatus !== 'all') {
          where.status = { equals: filterStatus }
        }

        if (searchQuery) {
          where.or = [
            { orderNumber: { contains: searchQuery } },
            { 'shippingAddress.firstName': { contains: searchQuery } },
            { 'shippingAddress.lastName': { contains: searchQuery } },
          ]
        }

        const response = await apiClient.find<Order>('orders', {
          where,
          sort: '-createdAt',
          depth: 1,
          limit: 100,
        })

        setOrders(response.docs)
      } catch (err: any) {
        setError(err.message || 'Failed to load orders')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [brand?.id, filterStatus, searchQuery])

  const currency = brand?.baseCurrency || 'GBP'
  const currencySymbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border border-panelGray text-panelGray'
      case 'paid':
        return 'border border-panelWhite text-panelWhite'
      case 'fulfilled':
        return 'bg-panelWhite text-panelBlack'
      case 'cancelled':
        return 'border border-red-500 text-red-500'
      case 'refunded':
        return 'border border-red-500 text-red-500'
      default:
        return 'border border-panelGray text-panelGray'
    }
  }

  const getBuyerName = (order: Order) => {
    const addr = order.shippingAddress
    if (addr?.firstName && addr?.lastName) {
      return `${addr.firstName} ${addr.lastName}`
    }
    if (addr?.firstName) return addr.firstName
    if (addr?.lastName) return addr.lastName
    return 'Unknown'
  }

  // Count items - would need to fetch order items for accurate count
  const getItemCount = (order: Order) => {
    // This is a placeholder - you'd need to query orderItems collection
    return '—'
  }

  return (
    <PanelLayout>
      <div className="max-w-7xl space-y-8">
      <div className="space-y-2">
        <h1 className="h1">Orders</h1>
        <p className="text-panelGray">Everything that's been bought from you through Gifter.</p>
      </div>

      {/* Filters */}
      <div className="card flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Search order # or buyer..."
          className="input flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="input w-full sm:w-48"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="card py-12 text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-panelWhite border-t-transparent" />
          <p className="text-sm text-panelGray">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card py-12 text-center">
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
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h3 className="h4 mb-2">No orders yet</h3>
          <p className="text-sm text-panelGray">
            {filterStatus === 'all'
              ? 'Your orders will appear here once customers start purchasing'
              : `No ${filterStatus} orders found`}
          </p>
        </div>
      ) : (
        /* Orders Table */
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-panelSoftGray">
                  <th className="p-4 text-left text-xs uppercase tracking-wider text-panelGray">
                    Order #
                  </th>
                  <th className="p-4 text-left text-xs uppercase tracking-wider text-panelGray">
                    Date
                  </th>
                  <th className="p-4 text-left text-xs uppercase tracking-wider text-panelGray">
                    Buyer
                  </th>
                  <th className="p-4 text-left text-xs uppercase tracking-wider text-panelGray">
                    Total
                  </th>
                  <th className="p-4 text-left text-xs uppercase tracking-wider text-panelGray">
                    Status
                  </th>
                  <th className="p-4 text-left text-xs uppercase tracking-wider text-panelGray">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-panelSoftGray hover:bg-panelSoftGray">
                    <td className="p-4">
                      <Link href={`/orders/${order.id}`} className="hover:text-panelWhite">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4 text-panelGray">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">{getBuyerName(order)}</td>
                    <td className="p-4 font-medium">
                      {currencySymbol}
                      {order.total.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs ${getStatusBadge(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-sm text-panelGray hover:text-panelWhite"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </PanelLayout>
  )
}
