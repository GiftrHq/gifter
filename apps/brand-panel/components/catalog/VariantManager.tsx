import { useState, useEffect } from 'react'
import { ProductVariant } from '@/lib/types/payload'
import { apiClient } from '@/lib/api/client'
import { VariantList } from './VariantList'
import { VariantForm } from './VariantForm'
import { BulkVariantGenerator } from './BulkVariantGenerator'

interface VariantManagerProps {
    productId?: string
    productSlug: string
    defaultCurrency: 'GBP' | 'USD' | 'EUR'
    // When creating a product, we manage variants in memory first
    initialPendingVariants?: ProductVariant[]
    onPendingChange?: (variants: ProductVariant[]) => void
}

export function VariantManager({
    productId,
    productSlug,
    defaultCurrency,
    initialPendingVariants = [],
    onPendingChange
}: VariantManagerProps) {
    const [variants, setVariants] = useState<ProductVariant[]>(initialPendingVariants)
    const [isLoading, setIsLoading] = useState(false)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isBulkOpen, setIsBulkOpen] = useState(false)
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

    const handleBulkGenerate = async (generated: ProductVariant[]) => {
        if (variants.length > 0) {
            if (!confirm(`This will add ${generated.length} more variants to your existing ${variants.length}. Continue?`)) {
                return
            }
        }

        if (!productId) {
            // Create mode
            setVariants(prev => [...prev, ...generated])
            setIsBulkOpen(false)
            return
        }

        // Live mode
        setIsLoading(true)
        try {
            const results = await Promise.all(
                generated.map(v => apiClient.create<ProductVariant>('productVariants', {
                    ...v,
                    product: productId,
                    id: undefined // Remove temp ID
                }))
            )
            setVariants(prev => [...prev, ...results])
            setIsBulkOpen(false)
        } catch (err) {
            alert('Failed to generate some variants')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClearAll = async () => {
        if (!confirm('Are you sure you want to delete ALL variants? This cannot be undone.')) return

        if (!productId) {
            setVariants([])
            return
        }

        setIsLoading(true)
        try {
            await Promise.all(variants.map(v => apiClient.delete('productVariants', v.id)))
            setVariants([])
        } catch (err) {
            alert('Failed to clear some variants')
        } finally {
            setIsLoading(false)
        }
    }

    const currencySymbol = defaultCurrency === 'GBP' ? '£' : defaultCurrency === 'USD' ? '$' : '€'

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-panelGray">
                    Variants ({variants.length})
                </h3>
                <div className="flex gap-4">
                    {variants.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="text-sm text-red-500 hover:text-red-400"
                        >
                            Clear All
                        </button>
                    )}
                    {!isFormOpen && !isBulkOpen && (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsBulkOpen(true)}
                                className="text-sm text-panelGray hover:text-panelWhite"
                            >
                                Bulk Generate
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(true)}
                                className="text-sm text-panelWhite hover:underline"
                            >
                                + Add Variant
                            </button>
                        </>
                    )}
                </div>
            </div>

            {isBulkOpen && (
                <BulkVariantGenerator
                    onGenerate={handleBulkGenerate}
                    onCancel={() => setIsBulkOpen(false)}
                    defaultPrice={0} // Parent should probably pass default price
                    defaultCurrency={defaultCurrency}
                    productSlug={productSlug}
                />
            )}

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
