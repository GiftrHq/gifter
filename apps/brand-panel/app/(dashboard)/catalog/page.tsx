'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { Product } from '@/lib/types/payload'
import { useAuth } from '@/lib/auth/AuthContext'
import { PanelLayout } from '@/components/layout/PanelLayout'

type FilterStatus = 'all' | 'draft' | 'published' | 'archived'

export default function CatalogPage() {
  const router = useRouter()
  const { brand } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  useEffect(() => {
    const loadProducts = async () => {
      if (!brand?.id) return

      setIsLoading(true)
      setError(null)

      // Clear products first to avoid showing stale data
      setProducts([])

      try {
        // Don't send brand filter - access control handles it automatically
        const where: any = {}

        if (filterStatus !== 'all') {
          where.status = { equals: filterStatus }
        }

        console.log('Fetching products with filter:', filterStatus, 'where:', where)
        console.log('Where clause stringified:', JSON.stringify(where))

        const response = await apiClient.find<Product>('products', {
          where,
          sort: '-updatedAt',
          depth: 1,
          limit: 100,
        })

        console.log('Received products:', response.docs.length, 'docs')
        console.log('Product details:', response.docs.map(p => ({ id: p.id, title: p.title, status: p.status })))
        setProducts(response.docs)
      } catch (err: any) {
        console.error('Error loading products:', err)
        setError(err.message || 'Failed to load products')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [brand?.id, filterStatus])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center rounded-full bg-panelGray/20 px-2 py-1 text-xs font-medium text-panelGray">
            Draft
          </span>
        )
      case 'published':
        return (
          <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-500">
            Published
          </span>
        )
      case 'archived':
        return (
          <span className="inline-flex items-center rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-500">
            Archived
          </span>
        )
      default:
        return null
    }
  }

  return (
    <PanelLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h2">Catalog</h1>
          <p className="mt-1 text-sm text-panelGray">
            Manage your products and inventory
          </p>
        </div>
        <Link href="/catalog/new" className="btn-primary">
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-panelWhite text-panelBlack'
              : 'text-panelGray hover:bg-panelSoftGray hover:text-panelWhite'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus('draft')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === 'draft'
              ? 'bg-panelWhite text-panelBlack'
              : 'text-panelGray hover:bg-panelSoftGray hover:text-panelWhite'
          }`}
        >
          Drafts
        </button>
        <button
          onClick={() => setFilterStatus('published')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === 'published'
              ? 'bg-panelWhite text-panelBlack'
              : 'text-panelGray hover:bg-panelSoftGray hover:text-panelWhite'
          }`}
        >
          Published
        </button>
        <button
          onClick={() => setFilterStatus('archived')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === 'archived'
              ? 'bg-panelWhite text-panelBlack'
              : 'text-panelGray hover:bg-panelSoftGray hover:text-panelWhite'
          }`}
        >
          Archived
        </button>
      </div>

      {/* Content */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-panelWhite border-t-transparent" />
            <p className="text-sm text-panelGray">Loading products...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="h4 mb-2">No products yet</h3>
          <p className="mb-4 text-sm text-panelGray">
            {filterStatus === 'all'
              ? "Get started by adding your first product"
              : `No ${filterStatus} products found`}
          </p>
          {filterStatus === 'all' && (
            <Link href="/catalog/new" className="btn-primary inline-block">
              Add Your First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const primaryImage = typeof product.primaryImage === 'object' ? product.primaryImage : null

            return (
              <Link
                key={product.id}
                href={`/catalog/edit/${product.id}`}
                className="card group relative overflow-hidden p-0 transition-all hover:border-panelWhite"
              >
                {/* Image */}
                <div className="aspect-square w-full overflow-hidden bg-panelSoftGray">
                  {primaryImage ? (
                    <img
                      src={primaryImage.sizes?.card?.url || primaryImage.url}
                      alt={primaryImage.alt || product.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <svg
                        className="h-12 w-12 text-panelGray"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="flex-1 font-medium line-clamp-2">{product.title}</h3>
                    {getStatusBadge(product.status)}
                  </div>

                  {product.shortDescription && (
                    <p className="mb-3 text-sm text-panelGray line-clamp-2">
                      {product.shortDescription}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    {!product.hasVariants && product.defaultPrice ? (
                      <span className="font-medium">
                        {product.defaultCurrency === 'GBP' && '£'}
                        {product.defaultCurrency === 'USD' && '$'}
                        {product.defaultCurrency === 'EUR' && '€'}
                        {product.defaultPrice.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm text-panelGray">Variants</span>
                    )}

                    {!product.hasVariants && product.defaultStock !== undefined && product.defaultStock > 0 && (
                      <span className="text-xs text-panelGray">
                        {product.defaultStock} in stock
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
    </PanelLayout>
  )
}
