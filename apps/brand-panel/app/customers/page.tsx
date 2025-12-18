'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { apiClient } from '@/lib/api/client'
import { Customer } from '@/lib/types/payload'
import { PanelLayout } from '@/components/layout/PanelLayout'

export default function CustomersPage() {
  const { brand } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadCustomers = async () => {
      if (!brand?.id) return

      setIsLoading(true)
      setError(null)

      try {
        const where: any = { brand: { equals: brand.id } }

        if (searchQuery) {
          where.or = [
            { email: { contains: searchQuery } },
            { firstName: { contains: searchQuery } },
            { lastName: { contains: searchQuery } },
          ]
        }

        const response = await apiClient.find<Customer>('customers', {
          where,
          sort: '-createdAt',
          limit: 100,
        })

        setCustomers(response.docs)
      } catch (err: any) {
        setError(err.message || 'Failed to load customers')
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomers()
  }, [brand?.id, searchQuery])

  const getInitials = (customer: Customer) => {
    if (customer.firstName && customer.lastName) {
      return `${customer.firstName[0]}${customer.lastName[0]}`.toUpperCase()
    }
    if (customer.firstName) return customer.firstName[0].toUpperCase()
    if (customer.lastName) return customer.lastName[0].toUpperCase()
    return customer.email[0].toUpperCase()
  }

  const getCustomerName = (customer: Customer) => {
    if (customer.firstName && customer.lastName) {
      return `${customer.firstName} ${customer.lastName}`
    }
    if (customer.firstName) return customer.firstName
    if (customer.lastName) return customer.lastName
    return customer.email
  }

  return (
    <PanelLayout>
      <div className="max-w-7xl space-y-8">
      <div className="space-y-2">
        <h1 className="h1">Customers</h1>
        <p className="text-panelGray">People who have ordered from you through Gifter.</p>
      </div>

      {/* Search */}
      <div className="card">
        <input
          type="search"
          placeholder="Search by name or email..."
          className="input w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
          <p className="text-sm text-panelGray">Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="h4 mb-2">No customers yet</h3>
          <p className="text-sm text-panelGray">
            {searchQuery
              ? 'No customers match your search'
              : 'Customers will appear here once they place orders'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((customer) => (
            <div key={customer.id} className="card flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-panelWhite font-medium text-panelBlack">
                {getInitials(customer)}
              </div>
              <div className="flex-1">
                <p className="font-medium">{getCustomerName(customer)}</p>
                <p className="text-sm text-panelGray">{customer.email}</p>
              </div>
              <div className="text-right text-sm text-panelGray">
                <p>Joined {new Date(customer.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </PanelLayout>
  )
}
