'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { apiClient } from '@/lib/api/client'
import { Brand, Media } from '@/lib/types/payload'
import { ImageUpload } from '@/components/media/ImageUpload'
import { PanelLayout } from '@/components/layout/PanelLayout'

const STYLE_TAGS = ['minimal', 'cozy', 'playful', 'luxurious', 'bold', 'earthy', 'modern', 'classic']

export default function BrandSettingsPage() {
  const { brand: authBrand, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: authBrand?.name || '',
    shortDescription: authBrand?.shortDescription || '',
    longDescription: authBrand?.longDescription || '',
    giftFit: authBrand?.giftFit || '',
    styleTags: authBrand?.styleTags || [],
    country: authBrand?.country || 'GB',
    baseCurrency: authBrand?.baseCurrency || 'GBP',
    websiteUrl: authBrand?.websiteUrl || '',
    instagramHandle: authBrand?.instagramHandle || '',
  })

  const [logo, setLogo] = useState<Media | undefined>(
    typeof authBrand?.logo === 'object' ? authBrand.logo : undefined
  )
  const [coverImage, setCoverImage] = useState<Media | undefined>(
    typeof authBrand?.coverImage === 'object' ? authBrand.coverImage : undefined
  )

  useEffect(() => {
    if (authBrand) {
      setFormData({
        name: authBrand.name || '',
        shortDescription: authBrand.shortDescription || '',
        longDescription: authBrand.longDescription || '',
        giftFit: authBrand.giftFit || '',
        styleTags: authBrand.styleTags || [],
        country: authBrand.country || 'GB',
        baseCurrency: authBrand.baseCurrency || 'GBP',
        websiteUrl: authBrand.websiteUrl || '',
        instagramHandle: authBrand.instagramHandle || '',
      })
      setLogo(typeof authBrand.logo === 'object' ? authBrand.logo : undefined)
      setCoverImage(typeof authBrand.coverImage === 'object' ? authBrand.coverImage : undefined)
    }
  }, [authBrand])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSuccessMessage(null)
  }

  const toggleStyleTag = (tag: string) => {
    const tags = formData.styleTags.includes(tag)
      ? formData.styleTags.filter((t) => t !== tag)
      : [...formData.styleTags, tag]
    handleInputChange('styleTags', tags)
  }

  const handleSave = async () => {
    if (!authBrand?.id) return

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const updateData = {
        ...formData,
        logo: logo?.id,
        coverImage: coverImage?.id,
      }

      await apiClient.update('brands', authBrand.id, updateData)
      await refreshUser()
      setSuccessMessage('Brand settings saved successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PanelLayout>
      <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="space-y-2">
        <h1 className="h1">Brand Settings</h1>
        <p className="text-panelGray">Manage your brand profile and how you appear in Gifter.</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-500">
          {successMessage}
        </div>
      )}

      {/* Brand Images */}
      <div className="card space-y-6">
        <h2 className="h4">Brand imagery</h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="label mb-2 block">Logo</label>
            <ImageUpload
              onUploadComplete={(media) => {
                setLogo(media)
                setSuccessMessage(null)
              }}
              existingImage={logo}
              aspectRatio={1}
              cropShape="round"
              label="Upload logo"
            />
            <p className="mt-2 text-xs text-panelGray">Square format, shown in search results</p>
          </div>

          <div>
            <label className="label mb-2 block">Cover Image</label>
            <ImageUpload
              onUploadComplete={(media) => {
                setCoverImage(media)
                setSuccessMessage(null)
              }}
              existingImage={coverImage}
              aspectRatio={16 / 9}
              label="Upload cover"
            />
            <p className="mt-2 text-xs text-panelGray">
              Wide format for your brand profile header
            </p>
          </div>
        </div>
      </div>

      {/* Public Brand Profile */}
      <div className="card">
        <h2 className="h4 mb-2">Public brand profile</h2>
        <p className="mb-6 text-sm text-panelGray">
          This is how I introduce you to gifters the first time they meet you.
        </p>

        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Brand Name</label>
            <input
              type="text"
              className="input w-full"
              placeholder="Your Brand"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div>
            <label className="label mb-2 block">Short Tagline</label>
            <input
              type="text"
              className="input w-full"
              placeholder="A brief introduction"
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              maxLength={200}
            />
            <p className="mt-1 text-xs text-panelGray">
              {formData.shortDescription?.length || 0}/200 characters
            </p>
          </div>

          <div>
            <label className="label mb-2 block">About</label>
            <textarea
              className="input w-full"
              rows={4}
              placeholder="Tell your brand story..."
              value={formData.longDescription}
              onChange={(e) => handleInputChange('longDescription', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Story / Positioning */}
      <div className="card">
        <h2 className="h4 mb-2">Story / Positioning</h2>
        <p className="mb-6 text-sm text-panelGray">
          Think in human terms: "for the design-obsessed friend", "for the home ritualist".
        </p>

        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Who are you for?</label>
            <input
              type="text"
              className="input w-full"
              placeholder="For the..."
              value={formData.giftFit}
              onChange={(e) => handleInputChange('giftFit', e.target.value)}
            />
          </div>

          <div>
            <label className="label mb-2 block">Style Tags</label>
            <div className="flex flex-wrap gap-2">
              {STYLE_TAGS.map((tag) => {
                const isSelected = formData.styleTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleStyleTag(tag)}
                    className={`rounded-full border px-4 py-2 text-sm transition-all ${
                      isSelected
                        ? 'border-panelWhite bg-panelWhite text-panelBlack'
                        : 'border-panelGray hover:border-panelWhite hover:bg-panelWhite/5'
                    }`}
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="card">
        <h2 className="h4 mb-6">Business details</h2>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label mb-2 block">Country</label>
              <select
                className="input w-full"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
              >
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="label mb-2 block">Base Currency</label>
              <select
                className="input w-full"
                value={formData.baseCurrency}
                onChange={(e) => handleInputChange('baseCurrency', e.target.value)}
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
              <p className="mt-1 text-xs text-panelGray">
                This is the currency for all your product prices
              </p>
            </div>
          </div>

          <div>
            <label className="label mb-2 block">Website URL</label>
            <input
              type="url"
              className="input w-full"
              placeholder="https://yourbrand.com"
              value={formData.websiteUrl}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
            />
          </div>

          <div>
            <label className="label mb-2 block">Instagram Handle</label>
            <input
              type="text"
              className="input w-full"
              placeholder="@yourbrand"
              value={formData.instagramHandle}
              onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Save Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-secondary"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
    </PanelLayout>
  )
}
