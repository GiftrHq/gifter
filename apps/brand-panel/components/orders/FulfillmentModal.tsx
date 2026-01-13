'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface FulfillmentModalProps {
    onConfirm: (data: { carrier: string; trackingNumber: string; trackingUrl?: string }) => void
    onCancel: () => void
    isLoading?: boolean
}

export function FulfillmentModal({ onConfirm, onCancel, isLoading }: FulfillmentModalProps) {
    const [carrier, setCarrier] = useState('royal_mail')
    const [trackingNumber, setTrackingNumber] = useState('')
    const [trackingUrl, setTrackingUrl] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onConfirm({ carrier, trackingNumber, trackingUrl })
    }

    const carriers = [
        { label: 'Royal Mail', value: 'royal_mail' },
        { label: 'UPS', value: 'ups' },
        { label: 'FedEx', value: 'fedex' },
        { label: 'DHL', value: 'dhl' },
        { label: 'DPD', value: 'dpd' },
        { label: 'Evri', value: 'evri' },
        { label: 'Other', value: 'other' },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-panelBlack/80 p-4 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card w-full max-w-md shadow-2xl"
            >
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="h3">Fulfill Order</h3>
                    <button onClick={onCancel} className="text-panelGray hover:text-panelWhite transition-colors">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-panelGray">
                        Enter shipping details to mark this order as fulfilled. The customer will be notified with these details.
                    </p>

                    <div>
                        <label className="label mb-2 block">Shipping Carrier</label>
                        <select
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            className="input w-full"
                            required
                        >
                            {carriers.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label mb-2 block">Tracking Number</label>
                        <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="input w-full"
                            placeholder="e.g. GB123456789"
                            required
                        />
                    </div>

                    <div>
                        <label className="label mb-2 block">Tracking URL (Optional)</label>
                        <input
                            type="url"
                            value={trackingUrl}
                            onChange={(e) => setTrackingUrl(e.target.value)}
                            className="input w-full"
                            placeholder="https://track.my-package.com/..."
                        />
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-panelSoftGray pt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn-secondary"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Complete Fulfillment'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
