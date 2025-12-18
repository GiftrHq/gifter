'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await apiClient.forgotPassword(email)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-panelBlack px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-panelWhite">
              <svg className="h-8 w-8 text-panelBlack" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="h2">Check your email</h1>
            <p className="mt-4 text-panelGray">
              I've sent password reset instructions to <strong>{email}</strong>
            </p>
            <p className="mt-2 text-sm text-panelGray">
              If you don't see the email, check your spam folder.
            </p>
          </div>

          <div className="text-center">
            <Link href="/login" className="btn-primary inline-block">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-panelBlack px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-panelWhite">
            <div className="h-8 w-8 rounded-full bg-panelBlack" />
          </div>
          <h1 className="h2">Reset your password</h1>
          <p className="mt-2 text-panelGray">
            Enter your email and I'll send you reset instructions.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label mb-2 block">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="you@brand.com"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send reset instructions'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-panelGray">
          Remember your password?{' '}
          <Link href="/login" className="text-panelWhite hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
