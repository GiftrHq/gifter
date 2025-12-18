'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    brandName: '',
    websiteUrl: '',
    shortDescription: '',
    country: 'GB',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // First create the brand
      const brand = await apiClient.create<{ id: string }>('brands', {
        name: formData.brandName,
        shortDescription: formData.shortDescription,
        websiteUrl: formData.websiteUrl,
        country: formData.country,
        status: 'pending', // Starts as pending approval
        baseCurrency: formData.country === 'GB' ? 'GBP' : 'USD',
      })

      // Then create the user linked to the brand
      await apiClient.create('users', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'brandOwner',
        brand: brand.id,
      })

      // Redirect to pending approval page
      router.push('/pending-approval')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-panelBlack px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-panelWhite">
            <div className="h-8 w-8 rounded-full bg-panelBlack" />
          </div>
          <h1 className="h2">Apply to join Gifter</h1>
          <p className="mt-2 text-panelGray">
            I'll review your application and get back to you soon.
          </p>
        </div>

        {/* Signup Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            {/* Personal Info */}
            <div>
              <h3 className="h4 mb-4">Your details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="label mb-2 block">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="input w-full"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="label mb-2 block">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="input w-full"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="email" className="label mb-2 block">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input w-full"
                  placeholder="you@brand.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mt-4">
                <label htmlFor="password" className="label mb-2 block">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input w-full"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-panelGray">
                  At least 8 characters
                </p>
              </div>
            </div>

            {/* Brand Info */}
            <div className="border-t border-panelSoftGray pt-6">
              <h3 className="h4 mb-4">Brand details</h3>

              <div>
                <label htmlFor="brandName" className="label mb-2 block">
                  Brand Name
                </label>
                <input
                  id="brandName"
                  type="text"
                  value={formData.brandName}
                  onChange={(e) =>
                    setFormData({ ...formData, brandName: e.target.value })
                  }
                  className="input w-full"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mt-4">
                <label htmlFor="shortDescription" className="label mb-2 block">
                  Short Description
                </label>
                <textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shortDescription: e.target.value,
                    })
                  }
                  className="input w-full"
                  rows={3}
                  maxLength={200}
                  placeholder="Tell me about your brand in a sentence or two..."
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="websiteUrl" className="label mb-2 block">
                    Website
                  </label>
                  <input
                    id="websiteUrl"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, websiteUrl: e.target.value })
                    }
                    className="input w-full"
                    placeholder="https://yourbrand.com"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="country" className="label mb-2 block">
                    Country
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="input w-full"
                    required
                    disabled={isLoading}
                  >
                    <option value="GB">United Kingdom</option>
                    <option value="US">United States</option>
                    <option value="FR">France</option>
                    <option value="DE">Germany</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit application'}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-panelGray">
          Already have an account?{' '}
          <Link href="/login" className="text-panelWhite hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
