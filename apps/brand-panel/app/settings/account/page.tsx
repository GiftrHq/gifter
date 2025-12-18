'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { apiClient } from '@/lib/api/client'
import { User } from '@/lib/types/payload'
import { PanelLayout } from '@/components/layout/PanelLayout'

export default function AccountSettingsPage() {
  const { user, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSuccessMessage(null)
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
    setSuccessMessage(null)
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await apiClient.update<User>('users', user.id, formData)
      await refreshUser()
      setSuccessMessage('Profile updated successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user?.id) return

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Please fill in all password fields')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await apiClient.update('users', user.id, {
        password: passwordData.newPassword,
      })
      setSuccessMessage('Password changed successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PanelLayout>
      <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="h1">Account Settings</h1>
        <p className="text-panelGray">Manage your personal account information and security.</p>
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

      {/* Profile Information */}
      <div className="card">
        <h2 className="h4 mb-6">Profile Information</h2>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label mb-2 block">First Name</label>
              <input
                type="text"
                className="input w-full"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
              />
            </div>

            <div>
              <label className="label mb-2 block">Last Name</label>
              <input
                type="text"
                className="input w-full"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label mb-2 block">Email Address</label>
            <input
              type="email"
              className="input w-full"
              placeholder="you@brand.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div>
            <label className="label mb-2 block">Role</label>
            <input
              type="text"
              className="input w-full bg-panelSoftGray/20"
              value={user?.role === 'brandOwner' ? 'Brand Owner' : user?.role || ''}
              disabled
            />
            <p className="mt-1 text-xs text-panelGray">Your account role cannot be changed</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSaveProfile}
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <h2 className="h4 mb-6">Change Password</h2>

        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Current Password</label>
            <input
              type="password"
              className="input w-full"
              placeholder="••••••••"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
            />
          </div>

          <div>
            <label className="label mb-2 block">New Password</label>
            <input
              type="password"
              className="input w-full"
              placeholder="••••••••"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
            />
            <p className="mt-1 text-xs text-panelGray">At least 8 characters</p>
          </div>

          <div>
            <label className="label mb-2 block">Confirm New Password</label>
            <input
              type="password"
              className="input w-full"
              placeholder="••••••••"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleChangePassword}
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Change password'}
          </button>
        </div>
      </div>

      {/* Account Information */}
      <div className="card bg-panelSoftGray/20">
        <h3 className="h4 mb-4">Account Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-panelGray">Account ID</span>
            <span className="font-mono text-xs">{user?.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-panelGray">Account Created</span>
            <span>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
    </PanelLayout>
  )
}
