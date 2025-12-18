'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { apiClient } from '@/lib/api/client'
import { Product, Media } from '@/lib/types/payload'
import { ImageUpload } from '@/components/media/ImageUpload'

interface ProductFormProps {
  product?: Product // If editing an existing product
  mode?: 'create' | 'edit'
}

// Helper to safely extract text from Lexical or plain text
function extractText(value: any): string {
  if (!value) return ''
  if (typeof value === 'string') return value

  // If it's a Lexical object, try to extract text from nodes
  if (typeof value === 'object' && value.root?.children) {
    const extractNodeText = (node: any): string => {
      if (node.text) return node.text
      if (node.children) {
        return node.children.map(extractNodeText).join('')
      }
      return ''
    }
    return value.root.children.map(extractNodeText).join('\n')
  }

  return ''
}

export function ProductForm({ product, mode = 'create' }: ProductFormProps) {
  const router = useRouter()
  const { brand } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Form state
  const [formData, setFormData] = useState({
    title: product?.title || '',
    shortDescription: product?.shortDescription || '',
    description: extractText(product?.description),
    status: product?.status || 'draft',
    hasVariants: product?.hasVariants || false,
    defaultPrice: product?.defaultPrice || 0,
    defaultCurrency: product?.defaultCurrency || brand?.baseCurrency || 'GBP',
    defaultSku: product?.defaultSku || '',
    defaultStock: product?.defaultStock || 0,
    isFeatured: product?.isFeatured || false,
    visibleToGifter: product?.visibleToGifter ?? true,
    occasionFit: product?.occasionFit || [],
    styleTags: product?.styleTags || [],
  })

  const [primaryImage, setPrimaryImage] = useState<Media | undefined>(
    typeof product?.primaryImage === 'object' ? product.primaryImage : undefined
  )
  const [gallery, setGallery] = useState<Media[]>(
    product?.gallery?.map((g) => g.image as Media) || []
  )
  const [giftTags, setGiftTags] = useState<string[]>(
    product?.giftTags?.map((t) => t.tag) || []
  )

  // Generate slug from title (matches server-side logic)
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSaveStatus('idle')
  }

  const handleSave = async (publishAfterSave: boolean = false) => {
    if (!formData.title) {
      setError('Product title is required')
      return
    }

    if (!formData.hasVariants && (!formData.defaultPrice || formData.defaultPrice <= 0)) {
      setError('Price is required for products without variants')
      return
    }

    setIsLoading(true)
    setError(null)
    setSaveStatus('saving')

    try {
      const slug = generateSlug(formData.title)

      const productData = {
        ...formData,
        slug,
        brand: brand?.id,
        primaryImage: primaryImage?.id,
        gallery: gallery.map((img) => ({ image: img.id })),
        giftTags: giftTags.map((tag) => ({ tag })),
        status: publishAfterSave ? 'published' : formData.status,
      }

      let savedProduct: Product

      if (mode === 'edit' && product?.id) {
        // Update existing product
        savedProduct = await apiClient.update<Product>('products', product.id, productData)
      } else {
        // Create new product
        savedProduct = await apiClient.create<Product>('products', productData)
      }

      setSaveStatus('saved')

      // Show success message briefly, then redirect
      setTimeout(() => {
        if (publishAfterSave) {
          router.push('/catalog')
        } else if (mode === 'create') {
          router.push(`/catalog/edit/${savedProduct.id}`)
        }
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to save product')
      setSaveStatus('idle')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = () => {
    handleSave(true)
  }

  const handleArchive = async () => {
    if (!product?.id) return

    if (!confirm('Are you sure you want to archive this product? It will no longer be visible.')) {
      return
    }

    try {
      await apiClient.update<Product>('products', product.id, { status: 'archived' })
      router.push('/catalog')
    } catch (err: any) {
      setError(err.message || 'Failed to archive product')
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h2">{mode === 'create' ? 'Add Product' : 'Edit Product'}</h1>
          <p className="mt-1 text-sm text-panelGray">
            {formData.status === 'draft' && 'Draft - not visible to customers'}
            {formData.status === 'published' && 'Published - visible to customers'}
            {formData.status === 'archived' && 'Archived - hidden from catalog'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-500">Saved</span>
          )}

          {mode === 'edit' && product?.status === 'published' && (
            <button
              type="button"
              onClick={handleArchive}
              className="btn-secondary"
              disabled={isLoading}
            >
              Archive
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSave(false)}
            className="btn-secondary"
            disabled={isLoading}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Draft'}
          </button>

          {formData.status !== 'published' && (
            <button
              type="button"
              onClick={handlePublish}
              className="btn-primary"
              disabled={isLoading}
            >
              {formData.status === 'draft' ? 'Publish' : 'Publish Changes'}
            </button>
          )}

          {formData.status === 'published' && (
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="btn-primary"
              disabled={isLoading}
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <div className="card space-y-6">
            <div>
              <h3 className="h4 mb-4">Basic Information</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="label mb-2 block">
                    Product Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="input w-full"
                    placeholder="e.g., Handcrafted Ceramic Mug"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="shortDescription" className="label mb-2 block">
                    Short Description
                  </label>
                  <textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    className="input w-full"
                    rows={2}
                    maxLength={200}
                    placeholder="Brief one-liner for search results and cards"
                  />
                  <p className="mt-1 text-xs text-panelGray">
                    {formData.shortDescription?.length || 0}/200 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="label mb-2 block">
                    Full Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="input w-full"
                    rows={6}
                    placeholder="Detailed product description, materials, care instructions, etc."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card space-y-6">
            <h3 className="h4">Product Images</h3>

            <div>
              <label className="label mb-2 block">Primary Image *</label>
              <ImageUpload
                onUploadComplete={(media) => {
                  setPrimaryImage(media)
                  setSaveStatus('idle')
                }}
                existingImage={primaryImage}
                aspectRatio={1}
                label="Upload primary image"
              />
              <p className="mt-2 text-xs text-panelGray">
                Main product photo. Square format works best.
              </p>
            </div>

            <div>
              <label className="label mb-2 block">
                Gallery ({gallery.length} {gallery.length === 1 ? 'image' : 'images'})
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                {gallery.map((image, index) => (
                  <div key={image.id} className="relative">
                    <img
                      src={image.sizes?.card?.url || image.url}
                      alt={image.alt || `Gallery image ${index + 1}`}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setGallery(gallery.filter((_, i) => i !== index))
                        setSaveStatus('idle')
                      }}
                      className="absolute right-2 top-2 rounded-full bg-panelBlack/80 p-2 text-panelWhite hover:bg-panelBlack"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                <ImageUpload
                  onUploadComplete={(media) => {
                    setGallery([...gallery, media])
                    setSaveStatus('idle')
                  }}
                  aspectRatio={1}
                  label="Add image"
                />
              </div>
              <p className="mt-2 text-xs text-panelGray">
                Additional product photos shown in the gallery
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="card space-y-6">
            <h3 className="h4">Pricing & Stock</h3>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasVariants}
                  onChange={(e) => handleInputChange('hasVariants', e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm">This product has variants (size, color, etc.)</span>
              </label>
            </div>

            {!formData.hasVariants && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="defaultPrice" className="label mb-2 block">
                    Price *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.defaultCurrency}
                      onChange={(e) => handleInputChange('defaultCurrency', e.target.value)}
                      className="input w-24"
                    >
                      <option value="GBP">GBP</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                    <input
                      id="defaultPrice"
                      type="number"
                      value={formData.defaultPrice}
                      onChange={(e) => handleInputChange('defaultPrice', parseFloat(e.target.value))}
                      className="input flex-1"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="defaultSku" className="label mb-2 block">
                    SKU
                  </label>
                  <input
                    id="defaultSku"
                    type="text"
                    value={formData.defaultSku}
                    onChange={(e) => handleInputChange('defaultSku', e.target.value)}
                    className="input w-full"
                    placeholder="e.g., MUG-CER-001"
                  />
                </div>

                <div>
                  <label htmlFor="defaultStock" className="label mb-2 block">
                    Stock Level
                  </label>
                  <input
                    id="defaultStock"
                    type="number"
                    value={formData.defaultStock}
                    onChange={(e) => handleInputChange('defaultStock', parseInt(e.target.value))}
                    className="input w-full"
                    placeholder="0"
                    min="0"
                  />
                  <p className="mt-1 text-xs text-panelGray">
                    Leave at 0 for unlimited stock
                  </p>
                </div>
              </div>
            )}

            {formData.hasVariants && (
              <div className="rounded-lg border border-panelSoftGray bg-panelSoftGray/20 p-4">
                <p className="text-sm text-panelGray">
                  Product variants will be managed after saving this product.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Gift Context */}
          <div className="card space-y-4">
            <h3 className="h4">Gift Context</h3>

            <div>
              <label className="label mb-2 block">Gift Tags</label>
              <textarea
                value={giftTags.join(', ')}
                onChange={(e) => {
                  const tags = e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter((t) => t.length > 0)
                  setGiftTags(tags)
                  setSaveStatus('idle')
                }}
                className="input w-full"
                rows={3}
                placeholder="e.g., cozy, handmade, sustainable"
              />
              <p className="mt-1 text-xs text-panelGray">
                Comma-separated tags for AI gift matching
              </p>
            </div>

            <div>
              <label className="label mb-2 block">Occasions</label>
              <select
                multiple
                value={formData.occasionFit}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value)
                  handleInputChange('occasionFit', selected)
                }}
                className="input w-full"
                size={6}
              >
                <option value="birthday">Birthday</option>
                <option value="christmas">Christmas</option>
                <option value="valentines">Valentine's Day</option>
                <option value="mothersDay">Mother's Day</option>
                <option value="fathersDay">Father's Day</option>
                <option value="anniversary">Anniversary</option>
                <option value="wedding">Wedding</option>
                <option value="housewarming">Housewarming</option>
                <option value="graduation">Graduation</option>
                <option value="thankyou">Thank You</option>
              </select>
              <p className="mt-1 text-xs text-panelGray">
                Hold Cmd/Ctrl to select multiple
              </p>
            </div>

            <div>
              <label className="label mb-2 block">Style Tags</label>
              <select
                multiple
                value={formData.styleTags}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value)
                  handleInputChange('styleTags', selected)
                }}
                className="input w-full"
                size={6}
              >
                <option value="minimal">Minimal</option>
                <option value="modern">Modern</option>
                <option value="rustic">Rustic</option>
                <option value="vintage">Vintage</option>
                <option value="luxury">Luxury</option>
                <option value="playful">Playful</option>
                <option value="elegant">Elegant</option>
                <option value="bohemian">Bohemian</option>
              </select>
            </div>
          </div>

          {/* Visibility */}
          <div className="card space-y-4">
            <h3 className="h4">Visibility</h3>

            <div>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">Featured Product</span>
                  <p className="text-xs text-panelGray">
                    Highlight in featured collections
                  </p>
                </div>
              </label>
            </div>

            <div>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.visibleToGifter}
                  onChange={(e) => handleInputChange('visibleToGifter', e.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">Visible in Gifter App</span>
                  <p className="text-xs text-panelGray">
                    Show to Gifter users for AI matching
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
