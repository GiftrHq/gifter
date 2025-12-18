'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import Link from 'next/link'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-panelBlack px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-panelWhite">
            <div className="h-8 w-8 rounded-full bg-panelBlack" />
          </div>
          <h1 className="h2">Gifter for Brands</h1>
          <p className="mt-2 text-panelGray">Sign in to manage your brand</p>
        </div>

        {/* Login Form */}
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

            <div>
              <label htmlFor="password" className="label mb-2 block">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/forgot-password"
                className="text-panelGray hover:text-panelWhite transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Signup Link */}
        <p className="text-center text-sm text-panelGray">
          New to Gifter?{' '}
          <Link
            href="/signup"
            className="text-panelWhite hover:underline"
          >
            Apply to join
          </Link>
        </p>
      </div>
    </div>
  )
}
