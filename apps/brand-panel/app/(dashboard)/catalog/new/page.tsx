'use client'

import { ProductForm } from '@/components/catalog/ProductForm'
import { PanelLayout } from '@/components/layout/PanelLayout'

export default function NewProductPage() {
  return (
    <PanelLayout>
      <ProductForm mode="create" />
    </PanelLayout>
  )
}
