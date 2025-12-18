'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect based on auth state
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [user, router])

  // Show loading while checking auth
  return (
    <div className="flex min-h-screen items-center justify-center bg-panelBlack">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-panelWhite border-t-transparent" />
        <p className="text-sm text-panelGray">Loading...</p>
      </div>
    </div>
  )
}
