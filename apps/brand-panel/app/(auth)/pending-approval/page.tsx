'use client'

import Link from 'next/link'

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-panelBlack px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-panelWhite">
            <svg
              className="h-8 w-8 text-panelBlack"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="h2">Application received</h1>
          <p className="mt-4 text-panelGray">
            Thank you for applying to join Gifter. I'm reviewing your application and will get
            back to you soon.
          </p>
          <p className="mt-4 text-sm text-panelGray">
            You'll receive an email once your brand is approved.
          </p>
        </div>

        <div className="card space-y-4">
          <h3 className="h4">What happens next?</h3>
          <ul className="space-y-3 text-sm text-panelGray">
            <li className="flex gap-3">
              <span className="text-panelWhite">1.</span>
              <span>I'll review your brand and website</span>
            </li>
            <li className="flex gap-3">
              <span className="text-panelWhite">2.</span>
              <span>If approved, you'll get an email with next steps</span>
            </li>
            <li className="flex gap-3">
              <span className="text-panelWhite">3.</span>
              <span>Set up your Stripe account for payouts</span>
            </li>
            <li className="flex gap-3">
              <span className="text-panelWhite">4.</span>
              <span>Start adding products to your catalog</span>
            </li>
          </ul>
        </div>

        <p className="text-center text-sm text-panelGray">
          <Link href="/login" className="text-panelWhite hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
