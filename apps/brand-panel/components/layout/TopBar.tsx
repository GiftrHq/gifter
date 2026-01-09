'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export function TopBar() {
  const { user, brand, logout } = useAuth()
  const router = useRouter()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const brandName = brand?.name || 'Your Brand'
  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email[0].toUpperCase()
    : 'U'


  // Get brand logo URL if available
  const brandLogo = brand?.logo && typeof brand.logo === 'object' ? brand.logo : null
  // Use PAYLOAD_URL for server-side (Docker), NEXT_PUBLIC_PAYLOAD_URL for client-side
  const payloadUrl = typeof window === 'undefined'
    ? (process.env.PAYLOAD_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001')
    : (process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001')

  const brandLogoUrl = brandLogo?.url
    ? (brandLogo.url.startsWith('http')
      ? brandLogo.url
      : `${payloadUrl}${brandLogo.url}`)
    : null

  console.log(`Brand URL: ${brandLogoUrl}`)

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const handleLogoutConfirm = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="fixed left-64 right-0 top-0 z-10 border-b border-panelSoftGray bg-panelBlack/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - could add breadcrumbs or page title here */}
        <div />

        {/* Right side - Brand name and user menu */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{brandName}</p>
            <p className="text-xs text-panelGray">
              {user?.role === 'admin' ? 'Admin' : 'Brand Account'}
            </p>
          </div>
          <button
            onClick={handleLogoutClick}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-panelWhite text-sm font-medium text-panelBlack hover:bg-panelGray transition-colors overflow-hidden"
            title="Click to log out"
          >
            {brandLogoUrl ? (
              <Image
                src={brandLogoUrl}
                alt={brandName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{userInitials}</span>
            )}
          </button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Log out"
        message="Are you sure you want to log out of your account?"
        confirmText="Log out"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </header>
  )
}
