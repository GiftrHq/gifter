'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { Product } from '@/lib/types/payload'
import { ProductForm } from '@/components/catalog/ProductForm'
import { PanelLayout } from '@/components/layout/PanelLayout'

export default function EditProductPage() {
  const params = useParams()
  const productId = params?.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await apiClient.findByID<Product>('products', productId, 2)
        setProduct(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load product')
      } finally {
        setIsLoading(false)
      }
    }

    if (productId) {
      loadProduct()
    }
  }, [productId])

  if (isLoading) {
    return (
      <PanelLayout>
        <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-panelWhite border-t-transparent" />
          <p className="text-sm text-panelGray">Loading product...</p>
        </div>
      </div>
      </PanelLayout>
    )
  }

  if (error || !product) {
    return (
      <PanelLayout>
        <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="h2 mb-2">Product not found</h1>
          <p className="text-panelGray">{error || 'This product does not exist'}</p>
        </div>
      </div>
      </PanelLayout>
    )
  }

  return (
    <PanelLayout>
      <ProductForm product={product} mode="edit" />
    </PanelLayout>
  )
}
