'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import clsx from 'clsx'
import NextImage from "next/image";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Catalog', href: '/catalog', icon: '📦' },
  { name: 'Orders', href: '/orders', icon: '🛒' },
  { name: 'Customers', href: '/customers', icon: '👥' },
  { name: 'Payouts', href: '/payouts', icon: '💳' },
  { name: 'Settings', href: '/settings/brand', icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { brand } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-panelSoftGray bg-panelBlack p-6">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-full">
            <NextImage
              src="/logo-transparent.png"
              alt="Gifter logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div>
            <h1 className="text-sm font-medium">Gifter</h1>
            <p className="text-xs text-panelGray">for Brands</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname?.startsWith(item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all',
                isActive
                  ? 'bg-panelWhite text-panelBlack'
                  : 'text-panelGray hover:bg-panelSoftGray hover:text-panelWhite'
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
