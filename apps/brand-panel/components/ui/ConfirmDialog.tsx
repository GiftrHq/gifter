'use client'

import { ReactNode } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'danger' | 'primary'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <>
      {/* Full page opaque black backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80"
        onClick={onClose}
      />

      {/* Centered dialog container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="card">
            {/* Header */}
            <div className="mb-4">
              <h3 className="h4">{title}</h3>
            </div>

            {/* Message */}
            <div className="mb-6 text-sm text-panelGray">
              {message}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 ${
                  confirmVariant === 'danger'
                    ? 'bg-red-500 text-white hover:bg-red-600 rounded-lg px-4 py-2 font-medium transition-colors'
                    : 'btn-primary'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
