import { useState, useEffect } from 'react'
import { ProductVariant } from '@/lib/types/payload'
import { apiClient } from '@/lib/api/client'
import { VariantList } from './VariantList'
import { VariantForm } from './VariantForm'

interface VariantManagerProps {
    productId?: string
    defaultCurrency: 'GBP' | 'USD' | 'EUR'
    // When creating a product, we manage variants in memory first
    initialPendingVariants?: ProductVariant[]
    onPendingChange?: (variants: ProductVariant[]) => void
}

export function VariantManager({
    productId,
    defaultCurrency,
    initialPendingVariants = [],
    onPendingChange
}: VariantManagerProps) {
    const [variants, setVariants] = useState<ProductVariant[]>(initialPendingVariants)
    const [isLoading, setIsLoading] = useState(false)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingVariant, setEditingVariant] = useState<ProductVariant | undefined>(undefined)

    // Load existing variants if we have a productId
    useEffect(() => {
        if (!productId) return

        const loadVariants = async () => {
            setIsLoading(true)
            try {
                const response = await apiClient.find<ProductVariant>('productVariants', {
                    where: { product: { equals: productId } },
                    limit: 100
                })
                setVariants(response.docs)
            } catch (err) {
                console.error('Failed to load variants:', err)
            } finally {
                setIsLoading(false)
            }
        }

        loadVariants()
    }, [productId])

    // Notify parent of changes to pending variants (only in create mode)
    useEffect(() => {
        if (!productId && onPendingChange) {
            onPendingChange(variants)
        }
    }, [variants, productId, onPendingChange])

    const handleSaveVariant = async (data: any) => {
        // If we have no productId, we are in "pending" mode (create product flow)
        if (!productId) {
            if (editingVariant) {
                // Update pending variant
                setVariants(prev => prev.map(v => v.id === editingVariant.id ? { ...v, ...data } : v))
            } else {
                // Create pending variant (assign temp ID)
                const newVariant = {
                    ...data,
                    id: `temp-${Date.now()}`,
                    product: 'pending'
                }
                setVariants(prev => [...prev, newVariant])
            }
            setIsFormOpen(false)
            setEditingVariant(undefined)
            return
        }

        // Live API mode
        try {
            if (editingVariant) {
                const updated = await apiClient.update<ProductVariant>(
                    'productVariants',
                    editingVariant.id,
                    { ...data }
                )
                setVariants(prev => prev.map(v => v.id === updated.id ? updated : v))
            } else {
                const created = await apiClient.create<ProductVariant>(
                    'productVariants',
                    { ...data, product: productId }
                )
                setVariants(prev => [...prev, created])
            }
            setIsFormOpen(false)
            setEditingVariant(undefined)
        } catch (err) {
            alert('Failed to save variant')
            console.error(err)
        }
    }

    const handleDeleteVariant = async (id: string) => {
        if (!confirm('Are you sure you want to delete this variant?')) return

        if (!productId) {
            setVariants(prev => prev.filter(v => v.id !== id))
            return
        }

        try {
            await apiClient.delete('productVariants', id)
            setVariants(prev => prev.filter(v => v.id !== id))
        } catch (err) {
            alert('Failed to delete variant')
        }
    }

    const currencySymbol = defaultCurrency === 'GBP' ? '£' : defaultCurrency === 'USD' ? '$' : '€'

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-panelGray">
                    Variants ({variants.length})
                </h3>
                {!isFormOpen && (
                    <button
                        type="button"
                        onClick={() => setIsFormOpen(true)}
                        className="text-sm text-panelWhite hover:underline"
                    >
                        + Add Variant
                    </button>
                )}
            </div>

            {isFormOpen ? (
                <VariantForm
                    initialData={editingVariant}
                    defaultCurrency={defaultCurrency}
                    onSave={handleSaveVariant}
                    onCancel={() => {
                        setIsFormOpen(false)
                        setEditingVariant(undefined)
                    }}
                />
            ) : (
                <VariantList
                    variants={variants}
                    currencySymbol={currencySymbol}
                    onEdit={(v) => {
                        setEditingVariant(v)
                        setIsFormOpen(true)
                    }}
                    onDelete={handleDeleteVariant}
                />
            )}
        </div>
    )
}
