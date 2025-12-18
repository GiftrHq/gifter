'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '../api/client'
import type { User, Brand } from '../types/payload'

interface AuthContextType {
  user: User | null
  brand: Brand | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [brand, setBrand] = useState<Brand | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('payload-token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await apiClient.me()
      const userData = response.user

      setUser(userData)

      // If user has a brand relationship, fetch brand details
      if (userData.brand) {
        const brandId = typeof userData.brand === 'string' ? userData.brand : userData.brand.id
        const brandData = await apiClient.findByID<Brand>('brands', brandId, 1)
        setBrand(brandData)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
      localStorage.removeItem('payload-token')
      setUser(null)
      setBrand(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)

      // Store token
      localStorage.setItem('payload-token', response.token)

      setUser(response.user)

      // Fetch brand if user has one
      if (response.user.brand) {
        const brandId = typeof response.user.brand === 'string'
          ? response.user.brand
          : response.user.brand.id
        const brandData = await apiClient.findByID<Brand>('brands', brandId, 1)
        setBrand(brandData)
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      localStorage.removeItem('payload-token')
      setUser(null)
      setBrand(null)
      router.push('/login')
    }
  }

  const refreshUser = async () => {
    await loadUser()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        brand,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to protect routes
export function useRequireAuth() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  return { user, isLoading }
}
